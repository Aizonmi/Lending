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
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/books', require('./routes/books'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Library Backend is running' });
});

const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT);

module.exports = app;
