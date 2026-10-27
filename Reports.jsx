import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Award,
  Download,
  Printer,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { getMonthlyReport } from '../services/dashboardService';
import { useNotification } from '../context/NotificationContext';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

const Reports = () => {
  const { showError } = useNotification();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMonthlyReport(selectedMonth);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to generate financial report');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, showError]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totals = report?.totals || {
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
    averageDailyExpense: 0,
    transactionCount: 0
  };

  const highestExpense = report?.highestExpenseCategory || { category: 'None', amount: 0, percentage: 0 };
  const categoryBreakdown = report?.categoryBreakdown || [];
  const dailyTrend = report?.dailyTrend || [];

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthFormatted = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="var(--primary)" />
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="page-subtitle">
            Comprehensive breakdown of cash flow, category distributions, and monthly savings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <input
              type="month"
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print Report">
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="stats-grid">
        {/* Highest Spending Category */}
        <div className="stat-card expense">
          <div className="stat-content">
            <span className="stat-label">Highest Expense Category</span>
            <span className="stat-value" style={{ fontSize: '1.45rem' }}>
              {highestExpense.category}
            </span>
            <span className="stat-subtext">
              ₹{highestExpense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({highestExpense.percentage}%)
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <Award size={24} />
          </div>
        </div>

        {/* Net Savings */}
        <div className="stat-card balance">
          <div className="stat-content">
            <span className="stat-label">Net Monthly Savings</span>
            <span
              className="stat-value"
              style={{
                color: totals.netSavings >= 0 ? 'var(--income-green)' : 'var(--expense-red)'
              }}
            >
              ₹{totals.netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="stat-subtext">
              {totals.netSavings >= 0 ? 'Surplus retained' : 'Deficit / Overdraft'}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Savings Rate */}
        <div className="stat-card income">
          <div className="stat-content">
            <span className="stat-label">Monthly Savings Rate</span>
            <span className="stat-value">
              {totals.savingsRate}%
            </span>
            <span className="stat-subtext">Percentage of income saved</span>
          </div>
          <div className="stat-icon-wrapper">
            <Percent size={22} />
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="stat-card transactions">
          <div className="stat-content">
            <span className="stat-label">Daily Avg Expense</span>
            <span className="stat-value">
              ₹{totals.averageDailyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="stat-subtext">Across this month</span>
          </div>
          <div className="stat-icon-wrapper">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Category Breakdown Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Spending Comparison</h3>
              <span className="card-subtitle">Expenses grouped by category for {monthFormatted}</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 10, right: 30, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <p className="empty-state-desc">No expense records found for {monthFormatted}</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Spending Trend for the Month */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Daily Spending Trajectory</h3>
              <span className="card-subtitle">Day-by-day expenditure throughout {monthFormatted}</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                    labelFormatter={(label) => `Day ${label} of ${monthFormatted}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#ef4444' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <p className="empty-state-desc">No daily activity recorded for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Category Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Category Breakdown — {monthFormatted}</h3>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Transactions</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Share of Total Expenses</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat, idx) => (
                  <tr key={cat.category}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: PALETTE[idx % PALETTE.length]
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{cat.category}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{cat.count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--expense-red)' }}>
                      ₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--bg-surface-alt)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${cat.percentage}%`,
                              height: '100%',
                              backgroundColor: PALETTE[idx % PALETTE.length]
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>{cat.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No expense transactions registered for {monthFormatted}.
          </p>
        )}
      </div>
    </div>
  );
};

export default Reports;
