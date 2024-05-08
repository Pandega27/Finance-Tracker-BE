const express = require('express');
const router = express.Router();
const Bill = require('../models/bill');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authentication');

router.get('/byCategory', authenticateToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); 

        const aggregatedData = await Bill.aggregate([
            { $match: { userId: userId, isPaid: true } },
            { $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" }
            }},
            { $project: {
                category: "$_id",
                amount: "$totalAmount",
                _id: 0
            }}
        ]);

        res.json(aggregatedData);
    } catch (error) {
        console.error("Error in aggregation:", error);
        res.status(500).json({ message: "Error fetching spending data by category", error: error.toString() });
    }
});

module.exports = router;
