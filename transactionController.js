import mongoose from 'mongoose';
import Transaction, { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../models/Transaction.js';

// @desc    Get all transactions with search, filter, sort & pagination
// @route   GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Search by title or description
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by type (income or expense)
    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Compute totals for currently filtered dataset
    const totalsAggregation = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let filteredIncome = 0;
    let filteredExpense = 0;
    totalsAggregation.forEach(item => {
      if (item._id === 'income') filteredIncome = item.total;
      if (item._id === 'expense') filteredExpense = item.total;
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      summary: {
        filteredIncome,
        filteredExpense,
        filteredNet: filteredIncome - filteredExpense
      },
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message
    });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction',
      error: error.message
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Field validations
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction title is required'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be either income or expense'
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const transaction = new Transaction({
      title: title.trim(),
      amount: parsedAmount,
      type: type.toLowerCase(),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : ''
    });

    const savedTransaction = await transaction.save();

    res.status(201).json({
      success: true,
      message: `${type === 'income' ? 'Income' : 'Expense'} recorded successfully`,
      data: savedTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const { title, amount, type, category, date, description } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0'
        });
      }
      updates.amount = parsedAmount;
    }
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either income or expense'
        });
      }
      updates.type = type.toLowerCase();
    }
    if (category !== undefined) updates.category = category.trim();
    if (date !== undefined) updates.date = new Date(date);
    if (description !== undefined) updates.description = description.trim();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
};

// @desc    Get default categories
// @route   GET /api/transactions/categories
export const getCategories = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      expense: EXPENSE_CATEGORIES,
      income: INCOME_CATEGORIES
    }
  });
};
