const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Student = require('../models/Student');

/**
 * @route   GET /api/dashboard/overdue
 * @desc    Get books past due date
 * @access  Public
 */
router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    
    // Find all active loans with due date in the past
    let overdueLoans = await Loan.find({
      status: { $in: ['active', 'overdue'] },
      returnDate: null,
      dueDate: { $lt: now }
    })
      .populate('itemId', 'title author owner description')
      .populate('borrowerMemberId', 'name email')
      .sort({ dueDate: 1 }); // Sort by due date, earliest first

    // Update status to overdue if needed
    for (let loan of overdueLoans) {
      if (loan.status !== 'overdue') {
        loan.status = 'overdue';
        await loan.save();
      }
    }

    res.json({
      message: 'Overdue items retrieved successfully',
      count: overdueLoans.length,
      data: overdueLoans
    });
  } catch (error) {
    console.error('Error fetching overdue items:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch overdue items',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics (most borrowed items, borrow counts by member, etc.)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Most borrowed books (top 5)
    const mostBorrowedItems = await Loan.aggregate([
      {
        $group: {
          _id: '$itemId',
          borrowCount: { $sum: 1 },
          activeBorrows: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          itemId: '$_id',
          title: '$item.title',
          author: '$item.author',
          borrowCount: 1,
          activeBorrows: 1
        }
      }
    ]);

    // Borrow counts by student (top 5)
    const borrowCountsByMember = await Loan.aggregate([
      {
        $group: {
          _id: '$borrowerMemberId',
          borrowCount: { $sum: 1 },
          activeBorrows: {
            $sum: { $cond: [{ $in: ['$status', ['active', 'overdue']] }, 1, 0] }
          },
          returnedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
          }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: '$member' },
      {
        $project: {
          memberId: '$_id',
          name: '$member.name',
          email: '$member.email',
          borrowCount: 1,
          activeBorrows: 1,
          returnedCount: 1
        }
      }
    ]);

    // Overall statistics
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: { $in: ['active', 'overdue'] } });
    const returnedLoans = await Loan.countDocuments({ status: 'returned' });
    const overdueLoans = await Loan.countDocuments({ status: 'overdue' });
    
    const totalItems = await Book.countDocuments();
    const availableItems = await Book.countDocuments({ available: true });
    const borrowedItems = totalItems - availableItems;
    
    const totalMembers = await Student.countDocuments();

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overall: {
          totalMembers,
          totalItems,
          availableItems,
          borrowedItems,
          totalLoans,
          activeLoans,
          returnedLoans,
          overdueLoans
        },
        mostBorrowedItems,
        borrowCountsByMember
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch dashboard statistics',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/dashboard/current-borrows
 * @desc    Get items currently borrowed with due dates and borrowers
 * @access  Public
 */
router.get('/current-borrows', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      status: { $in: ['active', 'overdue'] },
      returnDate: null
    };

    if (startDate || endDate) {
      query.borrowDate = {};
      if (startDate) {
        query.borrowDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.borrowDate.$lte = new Date(endDate);
      }
    }

    const loans = await Loan.find(query)
      .populate('itemId', 'title type owner description')
      .populate('borrowerMemberId', 'name email')
      .populate('itemId.owner', 'name email')
      .sort({ dueDate: 1 });

    res.json({
      message: 'Current borrows retrieved successfully',
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Error fetching current borrows:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch current borrows',
        status: 500
      }
    });
  }
});

/**
 * @route   GET /api/dashboard/notifications
 * @desc    Get notifications (e.g., overdue items)
 * @access  Public
 */
router.get('/notifications', async (req, res) => {
  try {
    const now = new Date();
    
    // Find overdue items
    const overdueLoans = await Loan.find({
      status: { $in: ['active', 'overdue'] },
      returnDate: null,
      dueDate: { $lt: now }
    })
      .populate('itemId', 'title author')
      .populate('borrowerMemberId', 'name email')
      .limit(10)
      .sort({ dueDate: 1 });

    const notifications = overdueLoans.map(loan => ({
      type: 'overdue',
      message: `Book "${loan.itemId.title}" is overdue. Borrower: ${loan.borrowerMemberId.name}`,
      loanId: loan._id,
      itemId: loan.itemId._id,
      borrowerId: loan.borrowerMemberId._id,
      dueDate: loan.dueDate,
      daysOverdue: Math.floor((now - loan.dueDate) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      message: 'Notifications retrieved successfully',
      count: notifications.length,
      hasOverdue: notifications.length > 0,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch notifications',
        status: 500
      }
    });
  }
});

module.exports = router;

