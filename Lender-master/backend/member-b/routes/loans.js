const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Student = require('../models/Student');

/**
 * @route   POST /api/loans/borrow
 * @desc    Borrow an item: update item availability, record loan
 * @access  Public
 */
router.post('/borrow', [
  body('itemId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Book ID must be a valid MongoDB ObjectId'),
  body('borrowerMemberId')
    .notEmpty()
    .withMessage('Borrower student ID is required')
    .isMongoId()
    .withMessage('Borrower student ID must be a valid MongoDB ObjectId'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { itemId, borrowerMemberId, dueDate } = req.body;

    // Verify book exists and is available
    const book = await Book.findById(itemId);
    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          status: 404
        }
      });
    }

    if (!book.available) {
      return res.status(409).json({
        error: {
          message: 'Book is not available for borrowing',
          status: 409
        }
      });
    }

    // Verify borrower exists
    const borrower = await Student.findById(borrowerMemberId);
    if (!borrower) {
      return res.status(404).json({
        error: {
          message: 'Borrower student not found',
          status: 404
        }
      });
    }


    // Create loan record
    const loan = new Loan({
      itemId,
      borrowerMemberId,
      dueDate: new Date(dueDate),
      borrowDate: new Date(),
      status: 'active'
    });

    await loan.save();

    // Update book availability
    book.available = false;
    await book.save();

    // Populate references for response
    await loan.populate('itemId', 'title author');
    await loan.populate('borrowerMemberId', 'name email');

    res.status(201).json({
      message: 'Item borrowed successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error borrowing item:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to borrow item',
        status: 500
      }
    });
  }
});

/**
 * @route   POST /api/loans/return
 * @desc    Return an item: update returnDate, status, update item availability
 * @access  Public
 */
router.post('/return', [
  body('loanId')
    .notEmpty()
    .withMessage('Loan ID is required')
    .isMongoId()
    .withMessage('Loan ID must be a valid MongoDB ObjectId')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { loanId } = req.body;

    // Find the loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        error: {
          message: 'Loan not found',
          status: 404
        }
      });
    }

    // Check if already returned
    if (loan.status === 'returned') {
      return res.status(409).json({
        error: {
          message: 'Item has already been returned',
          status: 409
        }
      });
    }

    // Update loan
    loan.returnDate = new Date();
    loan.status = 'returned';
    await loan.save();

    // Update book availability
    const book = await Book.findById(loan.itemId);
    if (book) {
      book.available = true;
      await book.save();
    }

    // Populate references for response
    await loan.populate('itemId', 'title author');
    await loan.populate('borrowerMemberId', 'name email');

    res.json({
      message: 'Item returned successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error returning item:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to return item',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/loans
 * @desc    List loans, including current and history
 * @access  Public
 * @query   status: filter by status (active, returned, overdue)
 * @query   borrowerMemberId: filter by borrower
 * @query   itemId: filter by item
 */
router.get('/', async (req, res) => {
  try {
    const { status, borrowerMemberId, itemId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (borrowerMemberId) {
      query.borrowerMemberId = borrowerMemberId;
    }

    if (itemId) {
      query.itemId = itemId;
    }

    const loans = await Loan.find(query)
      .populate('itemId', 'title author description')
      .populate('borrowerMemberId', 'name email')
      .sort({ borrowDate: -1 });

    res.json({
      message: 'Loans retrieved successfully',
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch loans',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/loans/:id
 * @desc    Get a single loan by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('itemId', 'title author description')
      .populate('borrowerMemberId', 'name email');

    if (!loan) {
      return res.status(404).json({
        error: {
          message: 'Loan not found',
          status: 404
        }
      });
    }

    // Check and update overdue status
    loan.checkOverdue();
    if (loan.isModified()) {
      await loan.save();
    }

    res.json({
      message: 'Loan retrieved successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid loan ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch loan',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/loans/available/items
 * @desc    Get list of available books for borrowing
 * @access  Public
 */
router.get('/available/items', async (req, res) => {
  try {
    const books = await Book.find({ available: true })
      .sort({ createdAt: -1 });

    res.json({
      message: 'Available books retrieved successfully',
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error fetching available books:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch available books',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/loans/borrowed/by/:memberId
 * @desc    Get list of books currently borrowed by a student
 * @access  Public
 */
router.get('/borrowed/by/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const loans = await Loan.find({
      borrowerMemberId: memberId,
      status: { $in: ['active', 'overdue'] }
    })
      .populate('itemId', 'title author description')
      .populate('borrowerMemberId', 'name email')
      .sort({ borrowDate: -1 });

    res.json({
      message: 'Borrowed books retrieved successfully',
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch borrowed books',
        status: 500
      }
    });
  }
});

module.exports = router;

