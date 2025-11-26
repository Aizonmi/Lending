const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');

/**
 * @route   POST /api/books
 * @desc    Add a new book
 * @access  Public
 */
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ISBN cannot exceed 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
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

    const { title, author, isbn, description, available } = req.body;

    const book = new Book({
      title,
      author: author || undefined,
      isbn: isbn || undefined,
      description: description || undefined,
      available: available !== undefined ? available : true
    });

    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create book',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/books
 * @desc    List all books
 * @access  Public
 * @query   available: filter by availability (true/false)
 */
router.get('/', async (req, res) => {
  try {
    const { available } = req.query;
    const query = {};

    if (available !== undefined) {
      query.available = available === 'true';
    }
    const books = await Book.find(query).sort({ createdAt: -1 });
    let data = books;
    if (books.length === 0) {
      const Item = require('../models/Item');
      const itemQuery = { type: 'book' };
      if (available !== undefined) {
        itemQuery.available = available === 'true';
      }
      const items = await Item.find(itemQuery).sort({ createdAt: -1 });
      data = items.map(i => ({
        _id: i._id,
        title: i.title,
        description: i.description,
        available: i.available,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt
      }));
    }
    res.json({
      message: 'Books retrieved successfully',
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch books',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/books/:id
 * @desc    Get a single book by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid book ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch book',
        status: 500
      }
    });
  }
});

/**
 * @route   PUT /api/books/:id
 * @desc    Update a book
 * @access  Public
 */
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ISBN cannot exceed 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to update book',
        status: 500
      }
    });
  }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book (e.g., if book is lost)
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          status: 404
        }
      });
    }

    // Check if book is currently borrowed
    const Loan = require('../models/Loan');
    const activeLoan = await Loan.findOne({
      itemId: req.params.id,
      status: { $in: ['active', 'overdue'] }
    });

    if (activeLoan) {
      return res.status(409).json({
        error: {
          message: 'Cannot delete book that is currently borrowed. Please return it first.',
          status: 409
        }
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Book deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid book ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to delete book',
        status: 500
      }
    });
  }
});

module.exports = router;
