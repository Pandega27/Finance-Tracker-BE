const express = require('express');
const { db } = require('./db/db');
const cors = require('cors');

//Route the files

const app = express();
const userRoutes = require('./route/account');
const incomeRoutes = require('./route/income');
const listBillsRoutes = require('./route/listBills');
const paymentRoutes = require('./route/payment');
const newBillRoutes = require('./route/newBill');
const spendingRoutes = require('./route/spending');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Api
app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/bills', listBillsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/newbills', newBillRoutes);
app.use('/api/spending', spendingRoutes);

// Connect to the database and start the server
const server = () => {
    db();
    app.listen(PORT, () => {
        console.log('listening to port:', PORT);
    });
};

server();
