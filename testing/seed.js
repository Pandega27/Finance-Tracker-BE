const mongoose = require('mongoose');
const User = require('../models/user');
const Bill = require('../models/bill');
require('dotenv').config({ path: 'C:/Users/jmoon/Downloads/Finance app/backend/.env' });


const seedBills = async () => {
    console.log('Starting the seeding process...');

    try {
        console.log('Connecting to MongoDB at URL:', process.env.MONGO_URL);
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Database connected successfully.');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Proceeding to create bills...`);

        for (const user of users) {
            console.log(`Creating bills for user: ${user.username}`);
            for (let i = 0; i < 5; i++) {  // Create 5 random bills for each user
                const newBill = new Bill({
                    userId: user._id,
                    description: `Random Bill ${i + 1}`,
                    amount: Math.floor(Math.random() * 100) + 50, // Random amount between 50 and 150
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Due date 30 days from now
                    isPaid: false
                });

                await newBill.save();
                console.log(`Bill ${i + 1}: ${newBill.description} for ${newBill.amount} created for user: ${user.username}`);
            }
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('An error occurred during the seeding process:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

seedBills();
