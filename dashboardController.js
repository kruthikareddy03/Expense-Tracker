import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { getCurrentMonthString } from './budgetController.js';

// @desc    Get complete dashboard summary metrics and chart series
// @route   GET /api/dashboard/summary
export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Overall Aggregation: Total Income and Total Expenses
    const overallAgg = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransactions = 0;

    overallAgg.forEach(item => {
      totalTransactions += item.count;
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const availableBalance = totalIncome - totalExpenses;

    // 2. Recent Transactions (Last 5)
    const recentTransactions = await Transaction.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 3. Monthly Income vs Expenses (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyDataAgg = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $project: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
          amount: '$amount'
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Build ordered list of the last 6 months with human-readable labels
    const monthsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      monthsMap[key] = {
        key,
        name: `${monthNames[m - 1]} ${y}`,
        shortName: monthNames[m - 1],
        income: 0,
        expenses: 0,
        net: 0
      };
    }

    monthlyDataAgg.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthsMap[key]) {
        if (item._id.type === 'income') {
          monthsMap[key].income += item.total;
        } else if (item._id.type === 'expense') {
          monthsMap[key].expenses += item.total;
        }
        monthsMap[key].net = monthsMap[key].income - monthsMap[key].expenses;
      }
    });

    const monthlyOverview = Object.values(monthsMap);

    // 4. Category-wise Expense breakdown
    const categoryAgg = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const categoryBreakdown = categoryAgg.map(cat => ({
      name: cat._id || 'Uncategorized',
      value: cat.total,
      count: cat.count,
      percentage: totalExpenses > 0 ? parseFloat(((cat.total / totalExpenses) * 100).toFixed(1)) : 0
    }));

    // 5. Monthly Spending Trend (from monthlyOverview)
    const spendingTrend = monthlyOverview.map(m => ({
      month: m.name,
      shortMonth: m.shortName,
      expense: m.expenses,
      income: m.income
    }));

    // 6. Current Month Budget Status
    const currentMonth = getCurrentMonthString();
    const currentMonthBudget = await Budget.findOne({ month: currentMonth, category: 'Overall' });
    
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthSpendingAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentMonthSpent = currentMonthSpendingAgg.length > 0 ? currentMonthSpendingAgg[0].total : 0;
    const budgetLimit = currentMonthBudget ? currentMonthBudget.amount : 0;
    const budgetUsedPercent = budgetLimit > 0 ? parseFloat(((currentMonthSpent / budgetLimit) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          balance: availableBalance,
          transactionsCount: totalTransactions
        },
        currentMonth: {
          month: currentMonth,
          spent: currentMonthSpent,
          budget: budgetLimit,
          remaining: budgetLimit > 0 ? budgetLimit - currentMonthSpent : 0,
          percentage: budgetUsedPercent,
          status: budgetLimit === 0 ? 'not_set' : budgetUsedPercent >= 100 ? 'exceeded' : budgetUsedPercent >= 80 ? 'warning' : 'normal'
        },
        recentTransactions,
        monthlyOverview,
        categoryBreakdown,
        spendingTrend
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard summary',
      error: error.message
    });
  }
};

// @desc    Get detailed monthly analytics and comparison report
// @route   GET /api/reports/monthly
export const getMonthlyReport = async (req, res) => {
  try {
    const requestedMonth = req.query.month || getCurrentMonthString();
    const [yearStr, monthStr] = requestedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Month totals
    const monthAgg = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let monthIncome = 0;
    let monthExpenses = 0;
    let transactionCount = 0;

    monthAgg.forEach(item => {
      transactionCount += item.count;
      if (item._id === 'income') monthIncome = item.total;
      if (item._id === 'expense') monthExpenses = item.total;
    });

    // Category breakdown for the month
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const categoryBreakdown = categoryAgg.map(cat => ({
      category: cat._id,
      amount: cat.total,
      count: cat.count,
      percentage: monthExpenses > 0 ? parseFloat(((cat.total / monthExpenses) * 100).toFixed(1)) : 0
    }));

    const highestExpenseCategory = categoryBreakdown.length > 0
      ? categoryBreakdown[0]
      : { category: 'None', amount: 0, percentage: 0 };

    // Daily breakdown for line/bar trend
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailySpendingMap = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailySpendingMap[day] = { day: `${day}`, expense: 0, income: 0 };
    }

    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          day: { $dayOfMonth: '$date' },
          type: '$type',
          amount: '$amount'
        }
      },
      {
        $group: {
          _id: { day: '$day', type: '$type' },
          total: { $sum: '$amount' }
        }
      }
    ]);

    dailyAgg.forEach(item => {
      const d = item._id.day;
      if (dailySpendingMap[d]) {
        if (item._id.type === 'expense') dailySpendingMap[d].expense = item.total;
        if (item._id.type === 'income') dailySpendingMap[d].income = item.total;
      }
    });

    const dailyTrend = Object.values(dailySpendingMap);

    // Savings rate: (Income - Expenses) / Income * 100
    const netSavings = monthIncome - monthExpenses;
    const savingsRate = monthIncome > 0 ? parseFloat(((netSavings / monthIncome) * 100).toFixed(1)) : 0;
    const averageDailyExpense = daysInMonth > 0 ? parseFloat((monthExpenses / daysInMonth).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        month: requestedMonth,
        totals: {
          income: monthIncome,
          expenses: monthExpenses,
          netSavings,
          savingsRate,
          averageDailyExpense,
          transactionCount
        },
        highestExpenseCategory,
        categoryBreakdown,
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report',
      error: error.message
    });
  }
};
