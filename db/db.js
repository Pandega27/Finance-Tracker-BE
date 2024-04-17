const mongoose = require('mongoose');

const db = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
    }
};

module.exports = { db };
