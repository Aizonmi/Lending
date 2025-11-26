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
    enum: {
      values: ['active', 'returned', 'overdue'],
      message: 'Status must be one of: active, returned, overdue'
    },
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

// Update status to overdue if past due date and still active
loanSchema.methods.checkOverdue = function() {
  if (this.status === 'active' && this.dueDate < new Date() && !this.returnDate) {
    this.status = 'overdue';
    return true;
  }
  return false;
};

// Indexes for faster queries
loanSchema.index({ borrowerMemberId: 1, status: 1 });
loanSchema.index({ itemId: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

// Pre-save hook to update status
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If returnDate is set, status should be returned
  if (this.returnDate && this.status !== 'returned') {
    this.status = 'returned';
  }
  
  // Check if overdue
  if (this.status === 'active' && this.dueDate < new Date() && !this.returnDate) {
    this.status = 'overdue';
  }
  
  next();
});

module.exports = mongoose.model('Loan', loanSchema);

