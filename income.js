// income.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticateToken = require('../middleware/authentication');

// Existing balance retrieval route is already here...

// Route to deposit (add) to the user's balance
router.post('/plus', authenticateToken, async (req, res) => {
    const { amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Amount must be greater than zero." });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.balance += amount; // Add the amount to the user's balance
        await user.save();
        res.json({ message: "Balance successfully increased.", balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating balance", error: error.message });
    }
});

// Route to withdraw (subtract) from the user's balance
router.post('/minus', authenticateToken, async (req, res) => {
    const { amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Amount must be greater than zero." });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient funds." });
        }

        user.balance -= amount; // Subtract the amount from the user's balance
        await user.save();
        res.json({ message: "Balance successfully decreased.", balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating balance", error: error.message });
    }
});

module.exports = router;
