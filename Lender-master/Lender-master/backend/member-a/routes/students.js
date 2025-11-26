const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');

/**
 * @route   POST /api/students
 * @desc    Add a new student
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
    .withMessage('Please provide a valid phone number'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Student ID cannot exceed 50 characters')
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

    const { name, email, phone, studentId } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        error: {
          message: 'Student with this email already exists',
          status: 409
        }
      });
    }

    const student = new Student({
      name,
      email,
      phone: phone || undefined,
      studentId: studentId || undefined
    });

    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create student',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/students
 * @desc    List all students
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    let data = students;
    if (students.length === 0) {
      const Member = require('../models/Member');
      const members = await Member.find().sort({ createdAt: -1 });
      data = members.map(m => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }));
    }
    res.json({
      message: 'Students retrieved successfully',
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch students',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        error: {
          message: 'Student not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Student retrieved successfully',
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid student ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch student',
        status: 500
      }
    });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student (e.g., if student is no longer in school)
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        error: {
          message: 'Student not found',
          status: 404
        }
      });
    }


    // Check if student has any active loans
    const Loan = require('../models/Loan');
    const activeLoans = await Loan.find({
      borrowerMemberId: req.params.id,
      status: { $in: ['active', 'overdue'] }
    });

    if (activeLoans.length > 0) {
      return res.status(409).json({
        error: {
          message: `Cannot delete student. They have ${activeLoans.length} active loan(s). Please return all books first.`,
          status: 409,
          loansCount: activeLoans.length
        }
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Student deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Invalid student ID',
          status: 400
        }
      });
    }
    res.status(500).json({
      error: {
        message: error.message || 'Failed to delete student',
        status: 500
      }
    });
  }
});

module.exports = router;
