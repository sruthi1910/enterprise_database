const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Define Schemas
const stockSchema = new mongoose.Schema({
    product: String,
    quantity: Number,
    condition: { type: String, enum: ['new', 'refurbished'], required: true },
    category: { type: String, enum: ['pc', 'laptop', 'accessory'], required: true }
});

const repairSchema = new mongoose.Schema({
    name: String,
    email: String,
    issue: String,
    date: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    address: String,
    products: [
        {
            product: String,
            quantity: Number,
            condition: { type: String, enum: ['new', 'refurbished'] },
            category: { type: String, enum: ['pc', 'laptop', 'accessory'] }
        }
    ],
    total: Number,
    date: { type: Date, default: Date.now }
});

// Define Models
const Stock = mongoose.model('Stock', stockSchema);
const Repair = mongoose.model('Repair', repairSchema);
const Order = mongoose.model('Order', orderSchema);

// Secret Key
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// Routes

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(403).json({ message: 'Invalid credentials.' });
});

// Stock Routes
app.get('/api/stock', authenticateToken, async (req, res) => {
    const { category, condition, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (condition) query.condition = condition;

    try {
        const stocks = await Stock.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Stock.countDocuments(query);

        res.json({
            stocks,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving stock.', error: err.message });
    }
});

app.post('/api/stock', authenticateToken, async (req, res) => {
    const { product, quantity, condition, category } = req.body;

    if (!product || quantity == null || !condition || !category) {
        return res.status(400).json({ message: 'All fields are required: product, quantity, condition, category.' });
    }

    let stockItem = await Stock.findOne({ product, condition, category });
    if (stockItem) {
        stockItem.quantity += quantity;
    } else {
        stockItem = new Stock({ product, quantity, condition, category });
    }

    await stockItem.save();
    res.json({ message: 'Stock updated.', stock: await Stock.find() });
});

// Repair Routes
app.post('/api/repairs', async (req, res) => {
    const { name, email, issue } = req.body;

    if (!name || !email || !issue) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const repair = new Repair({ name, email, issue });
    await repair.save();
    res.json({ message: 'Repair request submitted.' });
});

app.get('/api/repairs', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const repairs = await Repair.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Repair.countDocuments();

        res.json({
            repairs,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving repair requests.', error: err.message });
    }
});

app.put('/api/repairs/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, issue } = req.body;

    const repair = await Repair.findByIdAndUpdate(id, { name, email, issue }, { new: true });
    if (!repair) {
        return res.status(404).json({ message: 'Repair request not found.' });
    }

    res.json({ message: 'Repair request updated.', repair });
});

app.delete('/api/repairs/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    const repair = await Repair.findByIdAndDelete(id);
    if (!repair) {
        return res.status(404).json({ message: 'Repair request not found.' });
    }

    res.json({ message: 'Repair request deleted.' });
});

// Order Routes
app.post('/api/orders', async (req, res) => {
    const { customerName, email, address, products, total } = req.body;

    if (!customerName || !email || !address || !products || !total) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const order = new Order({ customerName, email, address, products, total });
    await order.save();
    res.json({ message: 'Order placed successfully.', order });
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders.', error: err.message });
    }
});

// Analytics Routes
app.get('/api/analytics/sales', authenticateToken, async (req, res) => {
    try {
        const sales = await Order.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products.category', totalSales: { $sum: '$products.quantity' } } }
        ]);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error calculating sales.', error: err.message });
    }
});

app.get('/api/analytics/low-stock', authenticateToken, async (req, res) => {
    try {
        const lowStockItems = await Stock.find({ quantity: { $lt: 10 } });
        res.json(lowStockItems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching low stock items.', error: err.message });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
