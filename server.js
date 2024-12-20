const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://rohani:rohani2024/2/8@cluster0.2ywo8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors({
    origin: ['https://your-github-username.github.io', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const customerSchema = new mongoose.Schema({
    name: String,
    address: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
    customerId: String,
    type: String, // 'rec' or 'send'
    value: Number,
    date: Date,
    notes: String
});

const moneyTransactionSchema = new mongoose.Schema({
    customerId: String,
    type: String, // 'rec' or 'send'
    amount: Number,
    currency: String, // 'AFN' or 'USD'
    date: Date,
    notes: String
});

const Customer = mongoose.model('Customer', customerSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const MoneyTransaction = mongoose.model('MoneyTransaction', moneyTransactionSchema);

// API Routes
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/transactions/:customerId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ customerId: req.params.customerId });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/money-transactions/:customerId', async (req, res) => {
    try {
        const transactions = await MoneyTransaction.find({ customerId: req.params.customerId });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/money-transactions', async (req, res) => {
    try {
        const transaction = new MoneyTransaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
