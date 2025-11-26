const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required'],
    index: true
  },
  borrowerMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Borrower student ID is required'],
    index: true
  },
  borrowDate: {
    type: Date,
    required: [true, 'Borrow date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > this.borrowDate;
      },
      message: 'Due date must be after borrow date'
    }
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'overdue', 'returned'],
    default: 'active',
    index: true
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

loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-update status based on dates
  if (this.returnDate) {
    this.status = 'returned';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  } else if (!this.returnDate) {
    this.status = 'active';
  }
  
  next();
});

// Indexes for faster queries
loanSchema.index({ borrowerMemberId: 1, status: 1 });
loanSchema.index({ itemId: 1, status: 1 });
loanSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Loan', loanSchema);

