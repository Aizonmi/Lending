// This is a reference model that matches Member A's Member schema
// In a real integration, this would be shared or imported
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// This model uses the same collection as Member A's Member model
// Make sure both systems use the same database
module.exports = mongoose.model('Member', memberSchema);

