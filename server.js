const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://rohani:rohani2024%2F2%2F8@cluster0.2ywo8.mongodb.net/hesabat?retryWrites=true&w=majority';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

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
// Customer routes
app.post('/api/customers', async (req, res) => {
    try {
        console.log('Received customer creation request:', req.body);
        const customer = new Customer(req.body);
        const savedCustomer = await customer.save();
        console.log('Customer saved successfully:', savedCustomer);
        res.json(savedCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        console.log('Received request to fetch all customers');
        const customers = await Customer.find();
        console.log(`Found ${customers.length} customers`);
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: error.message });
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

// Port configuration
const PORT = process.env.PORT || 3001;

// MongoDB Connection with better error handling
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => {
    console.log('Connected to MongoDB');
    // Start server only after successful database connection
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});
