const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

/**
 * @route   GET /api/loans/history
 * @desc    Get full loan history with optional date range filtering
 * @access  Public
 * @query   startDate: filter loans from this date (ISO 8601)
 * @query   endDate: filter loans until this date (ISO 8601)
 * @query   status: filter by status (active, returned, overdue)
 */
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.borrowDate = {};
      if (startDate) {
        query.borrowDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.borrowDate.$lte = new Date(endDate);
      }
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query)
      .populate('itemId', 'title author description')
      .populate('borrowerMemberId', 'name email')
      .sort({ borrowDate: -1 });

    res.json({
      message: 'Loan history retrieved successfully',
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Error fetching loan history:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch loan history',
        status: 500
      }
    });
  }
});

module.exports = router;

