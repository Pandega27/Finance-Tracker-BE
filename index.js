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
require('dotenv').config()

const PORT = process.env.PORT

// middlewares
app.use(express.json())
app.use(cors())
app.use('/api/users', userRoutes);
app.use('/api/income', incomeRoutes);

//listen at
const server = () =>{
    db()
    app.listen(PORT, () =>{
        console.log('listening to port:', PORT)
    })

}


server()