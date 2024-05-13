const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/bill');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const authenticateToken = require('../middleware/authentication');

// Pay a bill
router.post('/pay/:billId', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const billId = req.params.billId;
    try {
        console.log(`Attempting to pay bill with ID: ${billId}`);
        
        const bill = await Bill.findById(billId).session(session);
        if (!bill) {
            throw new Error('Bill not found');
        }

        if (bill.isPaid) {
            throw new Error('Bill is already paid');
        }

        const user = await User.findById(bill.userId).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.balance < bill.amount) {
            throw new Error('Insufficient funds');
        }

        bill.isPaid = true;
        bill.paidDate = new Date();
        await bill.save({ session });

        const transaction = new Transaction({
            userId: bill.userId,
            billId: bill._id,
            type: 'billPayment',
            amount: bill.amount,
            date: new Date(),
            category: bill.category 
        });
        await transaction.save({ session });

        user.balance -= bill.amount;
        await user.save({ session });

        await session.commitTransaction();
        console.log(`Bill with ID: ${billId} paid successfully`);
        res.json({ message: "Bill paid successfully", amount: bill.amount });
    } catch (error) {
        await session.abortTransaction();
        console.error(`Error paying bill with ID: ${billId}`, error.message);
        res.status(400).json({ message: "Error paying the bill", error: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;