const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Member = require('../models/Member');

/**
 * @route   POST /api/items
 * @desc    Add a new item
 * @access  Public
 */
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('type')
    .isIn(['book', 'tool', 'equipment', 'electronic', 'other'])
    .withMessage('Type must be one of: book, tool, equipment, electronic, other'),
  body('owner')
    .notEmpty()
    .withMessage('Owner is required')
    .isMongoId()
    .withMessage('Owner must be a valid member ID'),
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

    const { title, type, owner, description, available } = req.body;

    // Verify owner exists
    const ownerMember = await Member.findById(owner);
    if (!ownerMember) {
      return res.status(404).json({
        error: {
          message: 'Owner member not found',
          status: 404
        }
      });
    }

    const item = new Item({
      title,
      type,
      owner,
      description: description || undefined,
      available: available !== undefined ? available : true
    });

    await item.save();
    
    // Populate owner details in response
    await item.populate('owner', 'name email');

    res.status(201).json({
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create item',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/items
 * @desc    List all items
 * @access  Public
 * @query   available: filter by availability (true/false)
 * @query   type: filter by item type
 * @query   owner: filter by owner ID
 */
router.get('/', async (req, res) => {
  try {
    const { available, type, owner } = req.query;
    const query = {};

    if (available !== undefined) {
      query.available = available === 'true';
    }

    if (type) {
      query.type = type.toLowerCase();
    }

    if (owner) {
      query.owner = owner;
    }

    const items = await Item.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Items retrieved successfully',
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch items',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Get a single item by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email');
    
    if (!item) {
      return res.status(404).json({
        error: {
          message: 'Item not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Item retrieved successfully',
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid item ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch item',
        status: 500
      }
    });
  }
});

/**
 * @route   PUT /api/items/:id
 * @desc    Update an item
 * @access  Public
 */
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('type')
    .optional()
    .isIn(['book', 'tool', 'equipment', 'electronic', 'other'])
    .withMessage('Type must be one of: book, tool, equipment, electronic, other'),
  body('owner')
    .optional()
    .isMongoId()
    .withMessage('Owner must be a valid member ID'),
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

    const { owner } = req.body;
    
    // Verify owner exists if provided
    if (owner) {
      const ownerMember = await Member.findById(owner);
      if (!ownerMember) {
        return res.status(404).json({
          error: {
            message: 'Owner member not found',
            status: 404
          }
        });
      }
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!item) {
      return res.status(404).json({
        error: {
          message: 'Item not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to update item',
        status: 500
      }
    });
  }
});

module.exports = router;

