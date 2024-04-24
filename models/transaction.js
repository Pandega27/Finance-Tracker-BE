const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    },
    type: {
        type: String,
        enum: ['billPayment', 'other'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
