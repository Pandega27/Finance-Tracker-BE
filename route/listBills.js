const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const authenticateToken = require('../middleware/authentication');

// Retrieve unpaid bills for a user
router.get('/unpaid', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const bills = await Bill.find({ userId: userId, isPaid: false });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills", error: error.message });
    }
});

module.exports = router;