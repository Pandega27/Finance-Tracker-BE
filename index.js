// Needed tools
const express = require('express');
const mongoose = require('mongoose');
const { db } = require('./db/db');
const cors = require('cors');

//Route the files

const app = express();
const User = require('./models/user');
const userRoutes = require('./route/account');
const incomeRoutes = require('./route/income');
const listBillsRoutes = require('./route/listBills');
const paymentRoutes = require('./route/payment');
require('dotenv').config()

const newBillRoutes = require('./route/newBill');
const spendingRoutes = require('./route/spending');

const PORT = process.env.PORT

// middlewares
app.use(express.json())
app.use(cors())
app.use('/api/users', userRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/bills', listBillsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', newBillRoutes);
app.use('/api/spending', spendingRoutes);

//listen at
const server = () =>{
    db()
    app.listen(PORT, () =>{
        console.log('listening to port:', PORT)
    })

}


server()