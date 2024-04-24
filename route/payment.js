const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/bill');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const authenticateToken = require('../middleware/authentication');

//create a new bill
router.post('/create', authenticateToken, async (req, res) => {
    const { description, amount, dueDate } = req.body;
    const newBill = new Bill({
        userId: req.user.id,
        description,
        amount,
        dueDate
    });

    try {
        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        res.status(400).json({ message: "Error saving the bill", error: error.message });
    }
});

//retrieve all bills for a user
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.params.userId });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills", error: error.message });
    }
});

// pay a bill
router.post('/pay/:billId', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const billId = req.params.billId;
        const bill = await Bill.findById(billId).session(session);

        if (!bill) {
            throw new Error('Bill not found');
        }

        if (bill.isPaid) {
            throw new Error('Bill is already paid');
        }

        const user = await User.findById(bill.userId).session(session);
        if (user.balance < bill.amount) {
            throw new Error('Insufficient funds');
        }

        bill.isPaid = true;
        await bill.save({ session });

        const transaction = new Transaction({
            userId: bill.userId,
            billId: bill._id,
            type: 'billPayment',
            amount: bill.amount,
            date: new Date() // current date and time
        });
        await transaction.save({ session });

        user.balance -= bill.amount;
        await user.save({ session });

        await session.commitTransaction();
        res.json({ message: "Bill paid successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: "Error paying the bill", error: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
