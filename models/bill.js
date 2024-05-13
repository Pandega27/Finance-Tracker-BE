const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    createdDate: { 
        type: Date,
        default: Date.now 
    },
    paidDate: { 
        type: Date,
        default: null 
    },
    category: {
        type: String,
        enum: ['Others', 'Utilities', 'Lifestyle', 'Transport', 'Entertainment'],
        default: 'Others'
    }
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
