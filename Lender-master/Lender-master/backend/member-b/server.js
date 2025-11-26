const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with better timeout and error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendify';
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your MongoDB Atlas password in .env files');
    console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('3. Check network connectivity');
    console.error('4. Verify the connection string is correct\n');
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/loans', require('./routes/loans'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lending Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Member B Backend server running on port ${PORT}`);
});

module.exports = app;


