import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// Helper to get current YYYY-MM
export const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// @desc    Get all budgets
// @route   GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ month: -1 });
    res.status(200).json({
      success: true,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve budgets',
      error: error.message
    });
  }
};

// @desc    Get budget and spending status for a specific month
// @route   GET /api/budgets/status
export const getBudgetStatus = async (req, res) => {
  try {
    const requestedMonth = req.query.month || getCurrentMonthString();

    // Validate month format
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Expected YYYY-MM'
      });
    }

    const [yearStr, monthStr] = requestedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Find the budget document for this month
    const budgetDoc = await Budget.findOne({
      month: requestedMonth,
      category: 'Overall'
    });

    // Aggregate expenses for this month from MongoDB
    const spendingAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = spendingAgg.length > 0 ? spendingAgg[0].totalSpent : 0;
    const expenseCount = spendingAgg.length > 0 ? spendingAgg[0].count : 0;

    const budgetAmount = budgetDoc ? budgetDoc.amount : 0;
    const remaining = budgetAmount > 0 ? budgetAmount - totalSpent : 0;
    const rawPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
    const percentageUsed = parseFloat(rawPercentage.toFixed(1));

    let status = 'not_set';
    if (budgetAmount > 0) {
      if (percentageUsed >= 100) {
        status = 'exceeded';
      } else if (percentageUsed >= 80) {
        status = 'warning';
      } else {
        status = 'normal';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        month: requestedMonth,
        budgetAmount,
        totalSpent,
        remaining,
        percentageUsed,
        status,
        expenseCount,
        hasBudget: !!budgetDoc,
        notes: budgetDoc ? budgetDoc.notes : ''
      }
    });
  } catch (error) {
    console.error('Error fetching budget status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve budget status',
      error: error.message
    });
  }
};

// @desc    Set or update budget for a month
// @route   POST /api/budgets
export const setBudget = async (req, res) => {
  try {
    const { month, amount, notes } = req.body;

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Valid month in format YYYY-MM is required (e.g. 2026-10)'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number greater than 0'
      });
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { month, category: 'Overall' },
      {
        month,
        amount: parsedAmount,
        category: 'Overall',
        notes: notes ? notes.trim() : ''
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Monthly budget of ₹${parsedAmount.toLocaleString('en-IN')} set for ${month}`,
      data: updatedBudget
    });
  } catch (error) {
    console.error('Error setting budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set budget',
      error: error.message
    });
  }
};
