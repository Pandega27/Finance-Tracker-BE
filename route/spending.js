const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bill = require('../models/bill');
const Transaction = require('../models/transaction');
const authenticateToken = require('../middleware/authentication');

// Fetch bill data by category
router.get('/byCategory', authenticateToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const aggregatedData = await Bill.aggregate([
            { $match: { userId: userId, isPaid: true } },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
            { $project: { category: "$_id", amount: "$totalAmount", _id: 0 } }
        ]);
        res.json(aggregatedData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching spending data by category", error: error.toString() });
    }
});

// Fetch transactions for a user
router.get('/transactions/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!req.user || req.user.id !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        const transactions = await Transaction.find({ userId: userId })
            .populate({ path: 'billId', select: 'description category' })
            .sort({ date: -1 })
            .exec();
        res.json(transactions.map(transaction => ({
            _id: transaction._id,
            amount: transaction.amount,
            date: transaction.date,
            description: transaction.billId ? transaction.billId.description : 'No Description',
            category: transaction.billId ? transaction.billId.category : 'No Category'
        })));
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error: error.toString() });
    }
});

// Delete a transaction and update the related bill
router.delete('/transactions/:transactionId', authenticateToken, async (req, res) => {
    const transactionId = req.params.transactionId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const transaction = await Transaction.findById(transactionId).session(session);
        if (!transaction) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transaction.userId.toString() !== req.user.id) {
            await session.abortTransaction();
            return res.status(403).json({ message: 'Unauthorized to delete this transaction' });
        }
        await Transaction.deleteOne({ _id: transactionId }).session(session);
        const billId = transaction.billId;
        if (billId) {
            const bill = await Bill.findById(billId).session(session);
            if (bill) {
                bill.isPaid = false;
                bill.paidDate = null;
                await bill.save({ session });
            }
        }
        await session.commitTransaction();
        res.json({ message: 'Transaction and related bill updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Error removing transaction", error: error.toString() });
    } finally {
        session.endSession();
    }
});

module.exports = router;
