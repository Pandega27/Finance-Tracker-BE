const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true, 
        unique: true 
    },
    balance: {
        type: Number,
        default: 0 
    }
});

const User = mongoose.model('account', userSchema, 'account');

module.exports = User;
