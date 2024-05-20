const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/bill');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const authenticateToken = require('../middleware/authentication');

// Retrieve all bills for a user
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.params.userId }).select('description amount dueDate isPaid category createdDate paidDate');
        res.json(bills.map(bill => ({
            ...bill.toJSON(),
            categoryName: bill.category
        })));
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills", error: error.message });
    }
});

// Pay a bill
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
        res.json({ message: "Bill paid successfully", details: bill });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: "Error paying the bill", error: error.message });
    } finally {
        session.endSession();
    }
});

// Remove a bill route
router.delete('/remove/:billId', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const billId = req.params.billId;
        const bill = await Bill.findById(billId).session(session);

        if (!bill) {
            throw new Error('Bill not found');
        }

        // Ensure the user owns the bill
        if (bill.userId.toString() !== req.user.id) {
            throw new Error('Unauthorized to delete this bill');
        }

        await Bill.deleteOne({ _id: billId }).session(session);

        await session.commitTransaction();
        res.json({ message: 'Bill removed successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: "Error removing the bill", error: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;