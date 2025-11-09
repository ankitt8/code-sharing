const express = require('express');
const mongoose = require('mongoose');

// Only load dotenv in development (not in production/Cloud Run)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (for frontend integration)
app.use((req, res, next) => {
  console.log('CORS middleware', req.method, req.url);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// MongoDB URI - use environment variable if set, otherwise use hardcoded value
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ankit90499_db_user:LErzjAJbHXi0WdLy@cluster0.lsw0mgo.mongodb.net/?appName=Cluster0';

console.log('✅ Environment variables loaded');
console.log('🔗 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection error:', err.message);
    console.error('💡 Possible solutions:');
    console.error('   1. Check if your IP (103.89.43.229) is whitelisted in MongoDB Atlas');
    console.error('   2. Verify your MongoDB connection string in .env file');
    console.error('   3. Ensure your MongoDB cluster is running');
    process.exit(1);
  });

// 💰 Transaction Schema for Money Tracker (Simple Version)
const transactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
});

// Create Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

// 🏠 Home route
app.get('/', (req, res) => {
  res.json({
    message: '💰 Simple Money Tracker API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /transactions': 'Get all transactions',
      'GET /transactions/:id': 'Get transaction by ID',
      'POST /transactions': 'Create new transaction',
      'PUT /transactions/:id': 'Update transaction',
      'DELETE /transactions/:id': 'Delete transaction'
    },
    schema: {
      name: 'String (required)',
      amount: 'Number (required)',
      date: 'Date (required, defaults to now)'
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 📊 GET /transactions - Get all transactions
app.get('/transactions', async (req, res) => {
  try {
    console.log('📥 GET /transactions - Fetching transactions...');

    const transactions = await Transaction.find().sort({ date: -1 });

    console.log(`✅ Found ${transactions.length} transactions`);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// 🔍 GET /transactions/:id - Get single transaction
app.get('/transactions/:id', async (req, res) => {
  try {
    console.log(`🔍 GET /transactions/${req.params.id} - Fetching transaction...`);

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      console.log('❌ Transaction not found');
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log('✅ Transaction found');
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

// ➕ POST /transactions - Create new transaction
app.post('/transactions', async (req, res) => {
  try {
    console.log('➕ POST /transactions - Creating new transaction...');
    console.log('📝 Request body:', req.body);

    const transaction = new Transaction(req.body);
    const savedTransaction = await transaction.save();

    console.log('✅ Transaction created successfully:', savedTransaction._id);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: savedTransaction
    });
  } catch (error) {
    console.error('❌ Error creating transaction:', error.message);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
});

// ✏️ PUT /transactions/:id - Update transaction
app.put('/transactions/:id', async (req, res) => {
  try {
    console.log(`✏️ PUT /transactions/${req.params.id} - Updating transaction...`);
    console.log('📝 Request body:', req.body);

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      console.log('❌ Transaction not found');
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log('✅ Transaction updated successfully');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error updating transaction:', error.message);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

// 🗑️ DELETE /transactions/:id - Delete transaction
app.delete('/transactions/:id', async (req, res) => {
  try {
    console.log(`🗑️ DELETE /transactions/${req.params.id} - Deleting transaction...`);

    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      console.log('❌ Transaction not found');
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log('✅ Transaction deleted successfully');

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error deleting transaction:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /transactions',
      'GET /transactions/:id',
      'POST /transactions',
      'PUT /transactions/:id',
      'DELETE /transactions/:id'
    ]
  });
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Required for Cloud Run

app.listen(PORT, HOST, () => {
  console.log(`🚀 Simple Money Tracker Server is running on http://${HOST}:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  GET    /                     - API information');
  console.log('  GET    /transactions         - Get all transactions');
  console.log('  GET    /transactions/:id     - Get transaction by ID');
  console.log('  POST   /transactions         - Create new transaction');
  console.log('  PUT    /transactions/:id     - Update transaction');
  console.log('  DELETE /transactions/:id     - Delete transaction');
  console.log('');
  console.log('📝 Schema: { name: String, amount: Number, date: Date }');
});