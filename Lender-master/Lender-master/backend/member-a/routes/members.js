const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');

/**
 * @route   POST /api/members
 * @desc    Add a new member
 * @access  Public
 */
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number')
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

    const { name, email, phone } = req.body;

    // Check if member with email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(409).json({
        error: {
          message: 'Member with this email already exists',
          status: 409
        }
      });
    }

    const member = new Member({
      name,
      email,
      phone: phone || undefined
    });

    await member.save();

    res.status(201).json({
      message: 'Member created successfully',
      data: member
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create member',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/members
 * @desc    List all members
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    
    res.json({
      message: 'Members retrieved successfully',
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch members',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/members/:id
 * @desc    Get a single member by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        error: {
          message: 'Member not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Member retrieved successfully',
      data: member
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid member ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch member',
        status: 500
      }
    });
  }
});

module.exports = router;

