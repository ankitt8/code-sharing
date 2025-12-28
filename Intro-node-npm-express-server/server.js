const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const DIST_PATH = path.join(__dirname, 'dist');

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// CORS - Allow requests from webpack dev server and production
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:3000'],
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from React build (for production/Docker)
app.use(express.static(DIST_PATH));

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    console.warn('⚠️  No MONGODB_URI found in .env file');
    console.warn('💡 Running without database connection - API endpoints will fail');
    console.warn('💡 Add MONGODB_URI to your .env file to enable database features');
} else {
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
}

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

// In-memory storage (fallback when MongoDB is not connected)
let inMemoryUsers = [];

// API Routes
app.get('/', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
        message: '🚀 Backend API Server',
        status: 'running',
        database: isDbConnected ? 'connected (MongoDB)' : 'disconnected (using in-memory storage)',
        storageMode: isDbConnected ? 'persistent' : 'temporary',
        inMemoryUsers: isDbConnected ? 'N/A' : inMemoryUsers.length,
        endpoints: {
            'GET /': 'API info',
            'GET /about-us': 'About endpoint',
            'POST /submit': 'Submit user (name, email)',
            'GET /users': 'Get all users',
            'GET /users/:id': 'Get user by ID',
            'POST /api/greet': 'Greet API'
        }
    });
});

app.get('/about-us', (req, res) => {
    res.json({
        message: 'Hello World',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// POST /submit - Save user to MongoDB (or in-memory if DB not connected)
app.post('/submit', async (req, res) => {
    try {
        console.log('📝 POST /submit - Request received');
        console.log('📦 Request body:', req.body);
        console.log('🔗 MongoDB connection state:', mongoose.connection.readyState, '(1=connected, 0=disconnected)');

        const { name, email } = req.body;

        if (!name || !email) {
            console.log('❌ Validation failed: Missing name or email');
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        // If MongoDB is connected, save to database
        if (mongoose.connection.readyState === 1) {
            const user = new User({ name, email });
            const savedUser = await user.save();
            console.log('✅ User saved to MongoDB:', savedUser._id);

            return res.json({
                message: `Hello ${savedUser.name}! Your data has been saved to MongoDB.`,
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    createdAt: savedUser.createdAt
                }
            });
        }

        // Fallback: Save to in-memory storage
        console.log('⚠️  MongoDB not connected - saving to in-memory storage');
        const newUser = {
            _id: Date.now().toString(),
            name,
            email,
            createdAt: new Date()
        };
        inMemoryUsers.push(newUser);
        console.log('✅ User saved to memory:', newUser._id);

        res.json({
            message: `Hello ${newUser.name}! Your data has been saved (in-memory, will be lost on restart).`,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            },
            warning: 'Data stored in memory only. Set up MongoDB for persistent storage.'
        });
    } catch (error) {
        console.error('❌ Error saving user:', error.message);
        res.status(500).json({
            error: 'Failed to save user',
            message: error.message
        });
    }
});

// GET /users - Get all users from MongoDB (or in-memory if DB not connected)
app.get('/users', async (req, res) => {
    try {
        console.log('📥 GET /users - Request received');
        console.log('🔗 MongoDB connection state:', mongoose.connection.readyState, '(1=connected, 0=disconnected)');

        // If MongoDB is connected, fetch from database
        if (mongoose.connection.readyState === 1) {
            const users = await User.find().sort({ createdAt: -1 });
            console.log(`✅ Found ${users.length} users in MongoDB`);
            return res.json({
                success: true,
                count: users.length,
                data: users
            });
        }

        // Fallback: Return in-memory users
        console.log(`⚠️  MongoDB not connected - returning ${inMemoryUsers.length} users from memory`);
        res.json({
            success: true,
            count: inMemoryUsers.length,
            data: inMemoryUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            warning: 'Data from in-memory storage. Set up MongoDB for persistent storage.'
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error.message);
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

// Serve React app for all non-API routes (for production/Docker)
// Using app.use() instead of app.get('/*') for Express 5 compatibility
app.use((req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api') ||
        req.path.startsWith('/users') ||
        req.path.startsWith('/submit') ||
        req.path.startsWith('/about-us')) {
        return next();
    }

    // Only handle GET requests for serving React app
    if (req.method !== 'GET') {
        return next();
    }

    // Serve React app
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: 'Frontend not built',
            message: 'Run "npm run build" to build the React app'
        });
    }
});

// 404 handler for undefined API routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        availableEndpoints: {
            'GET /': 'API info (or React app if built)',
            'GET /about-us': 'About endpoint',
            'POST /submit': 'Submit user (name, email)',
            'GET /users': 'Get all users',
            'GET /users/:id': 'Get user by ID',
            'POST /api/greet': 'Greet API'
        }
    });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Required for Cloud Run

app.listen(PORT, HOST, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📋 Available API Endpoints:`);
    console.log(`   GET    /               - API info`);
    console.log(`   GET    /about-us       - About endpoint`);
    console.log(`   POST   /submit         - Submit user (name, email)`);
    console.log(`   GET    /users          - Get all users`);
    console.log(`   GET    /users/:id      - Get user by ID`);
    console.log(`   POST   /api/greet      - Greet API`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📦 Serving React app from: ${DIST_PATH}`);
    console.log(`💡 Frontend Dev Server: http://localhost:8081`);
    console.log(`   Run: npm run dev\n`);
});