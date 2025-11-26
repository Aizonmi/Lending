// This is a reference model that matches Member A's Item schema
// In a real integration, this would be shared or imported
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['book', 'tool', 'equipment', 'electronic', 'other'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
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

// This model uses the same collection as Member A's Item model
// Make sure both systems use the same database
module.exports = mongoose.model('Item', itemSchema);

