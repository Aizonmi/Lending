const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.RENDER_EXTERNAL_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  process.env.RAILWAY_STATIC_URL
].filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
  if (allowedOrigins.length === 0 || !origin) return cb(null, true);
  const norm = (o) => o.replace(/^https?:\/\//, '');
  const ok = allowedOrigins.some((ao) => norm(origin) === norm(ao));
  cb(ok ? null : new Error('Not allowed by CORS'));
}, credentials: true }));
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
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/loans', require('./routes/loans'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dashboard Backend is running' });
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

const PORT = process.env.PORT || 5002;
app.listen(PORT);

module.exports = app;
