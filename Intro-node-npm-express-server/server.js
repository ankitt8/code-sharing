const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// app.use(cors());
app.use(function (req, res, next) {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST,DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return res.sendStatus(200);
    }
    next();
})

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || '';

console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas successfully!');
    })
    .catch(err => {
        console.error('❌ MongoDB Connection error:', err.message);
        console.error('💡 Make sure your MongoDB Atlas connection string is correct in .env file');
    });

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create User model
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/takeuserinput.html');
});

app.get('/about-us', (req, res) => {
    res.json({
        message: 'Hello World',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// POST /submit - Save user to MongoDB
app.post('/submit', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        // Create and save user to MongoDB
        const user = new User({ name, email });
        const savedUser = await user.save();

        res.json({
            message: `Hello ${savedUser.name}! Your data has been saved to MongoDB.`,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                createdAt: savedUser.createdAt
            }
        });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({
            error: 'Failed to save user to database',
            message: error.message
        });
    }
});

// GET /users - Get all users from MongoDB
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        });
    }
});

// GET /users/:id - Get single user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        });
    }
});

// New API endpoint that takes name and returns with Hello World
app.post('/api/greet', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Optionally save to database
        const user = new User({ name, email: `${name.toLowerCase().replace(' ', '.')}@example.com` });
        await user.save();

        res.json({
            message: `Hello World ${name}`,
            saved: true,
            userId: user._id
        });
    } catch (error) {
        console.error('Error in /api/greet:', error);
        res.status(500).json({
            error: 'Failed to process request',
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  /              - Home page`);
    console.log(`   GET  /about-us      - About page`);
    console.log(`   POST /submit        - Submit user (name, email)`);
    console.log(`   GET  /users         - Get all users`);
    console.log(`   GET  /users/:id     - Get user by ID`);
    console.log(`   POST /api/greet     - Greet API`);
});