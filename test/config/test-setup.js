const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("useCreateIndex", true);
mongoose.promise = global.Promise;

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
}

async function dropAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        try {
            await collection.drop();
        } catch (error) {
            // Sometimes this error happens, but you can safely ignore it
            if (error.message === "ns not found") return;
            // This error occurs when you use it.todo. You can
            // safely ignore this error too
            if (error.message.includes("a background operation is currently running")) return;
            console.log(error.message);
        }
    }
}

module.exports = {
    setupDB() {
        // Connect to Mongoose
        beforeAll(async () => {
            await mongoose.connect(process.env.DB_PATH, {
                useCreateIndex: true,
                useNewUrlParser: true,
                dbName: process.env.DB_JEST,
                useUnifiedTopology: true,
                useFindAndModify: false,
            });
        });

        // Disconnect Mongoose
        afterAll(async () => {
            await removeAllCollections();
            await dropAllCollections();
            await mongoose.connection.close();
        });
    },
};
