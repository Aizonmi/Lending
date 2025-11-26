const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Item type is required'],
    enum: {
      values: ['book', 'tool', 'equipment', 'electronic', 'other'],
      message: 'Item type must be one of: book, tool, equipment, electronic, other'
    },
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Item owner is required'],
    validate: {
      validator: async function(value) {
        const Member = mongoose.model('Member');
        const member = await Member.findById(value);
        return member !== null;
      },
      message: 'Owner must be a valid member'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
itemSchema.index({ owner: 1 });
itemSchema.index({ available: 1 });
itemSchema.index({ type: 1 });

module.exports = mongoose.model('Item', itemSchema);

