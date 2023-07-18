const express = require('express');
require('dotenv').config();
const { connectToCollection, desconnect, generarId } = require('../connection_db.js');

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/api/v1/muebles', async (req, res) => {
    const { categoria, precio_gte, precio_lte } = req.query;

    const filtro = {
        ...(categoria && { categoria }),
        ...(precio_gte && { 'precio': { $gte: Number(precio_gte) } }),
        ...(precio_lte && { 'precio': { $lte: Number(precio_lte) } })
    };

    const orden = {
        ...(categoria && { 'nombre': 1 }),
        ...(precio_gte && { 'precio': 1 }),
        ...(precio_lte && { 'precio': -1 })
    };

    try {
        const collection = await connectToCollection('muebles');
        const muebles = await collection.find(filtro).sort(orden).toArray();

        res.status(200).json({ payload: muebles });
    } catch (error) {
        res.status(500).json({ message: 'Se ha generado un error en el servidor' });
    } finally {
        await desconnect();
    }
});

server.get('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: Number(codigo) });

        if (!mueble) return res.status(400).json({ message: 'El código no corresponde a un mueble registrado' });

        res.status(200).json({ payload: mueble });
    } catch (error) {
        res.status(500).json({ message: 'Se ha generado un error en el servidor' });
    } finally {
        await desconnect();
    }
});

server.post('/api/v1/muebles', async (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (!nombre || !precio || !categoria) return res.status(400).json({ message: 'Faltan datos relevantes' });

    try {
        const collection = await connectToCollection('muebles');
        const mueble = { codigo: await generarId(collection), nombre, precio: Number(precio), categoria };

        await collection.insertOne(mueble);

        res.status(201).json({ message: 'Registro creado', payload: mueble });
    } catch (error) {
        res.status(500).json({ message: 'Se ha generado un error en el servidor' });
    } finally {
        await desconnect();
    }
});

server.put('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { nombre, precio, categoria } = req.body;

    if (!nombre || !precio || !categoria) return res.status(400).json({ message: 'Faltan datos relevantes' });

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({ codigo: Number(codigo) });

        if (!mueble) return res.status(400).json({ message: 'El código no corresponde a un mueble registrado' });

        mueble = { nombre, precio: Number(precio), categoria };

        await collection.updateOne({ codigo: Number(codigo) }, { $set: mueble });

        res.status(200).json({ message: 'Registro actualizado', payload: mueble });
    } catch (error) {
        res.status(500).json({ message: 'Se ha generado un error en el servidor' });
    } finally {
        await desconnect();
    }
});

server.delete('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: Number(codigo) });

        if (!mueble) return res.status(400).json({ message: 'El código no corresponde a un mueble registrado' });

        await collection.deleteOne({ codigo: Number(codigo) });

        res.status(200).json({ message: 'Registro eliminado', eliminado: mueble });
    } catch (error) {
        res.status(500).json({ message: 'Se ha generado un error en el servidor' });
    } finally {
        await desconnect();
    }
});

server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/v1/muebles`);
});