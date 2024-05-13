const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const authenticateToken = require('../middleware/authentication');

// POST route to add a new bill
router.post('/add', authenticateToken, async (req, res) => {
    const { description, amount, dueDate, category } = req.body;
    const newBill = new Bill({
        userId: req.user.id,
        description,
        amount,
        dueDate,
        category
    });
    try {
        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        res.status(400).json({ message: "Error saving the bill", error: error.message });
    }
});

module.exports = router;
