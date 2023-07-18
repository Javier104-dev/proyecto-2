const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, './.env') });


const client = new MongoClient(process.env.DATABASE_URL);

const connect = async () => {
    let connection = null;
    console.log('Conectando...');

    try {
        connection = await client.connect();
        console.log('Conectado');
    } catch (error) {
        console.log(error.message);
    }

    return connection;
};

const desconnect = async () => {
    try {
        await client.close();
        console.log('Desconectado');
    } catch (error) {
        console.log(error.message);
    }
};

const connectToCollection = async (collectionName) => {
    const connection = await connect();
    const db = connection.db(process.env.DATABASE_NAME);
    const collection = db.collection(collectionName);

    return collection;
};

const generarId = async (collection) => {
    const documentMaxId = await collection.find().sort({ codigo: -1 }).limit(1).toArray();
    const maxId = documentMaxId[0]?.codigo ?? 0;

    return maxId + 1;
};

module.exports = {
    connectToCollection,
    desconnect,
    generarId
};