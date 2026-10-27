import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
  AlertTriangle,
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  BarChart2,
  Calendar
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
  AreaChart,
  Area
} from 'recharts';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import BudgetModal from '../components/BudgetModal';
import { getDashboardSummary } from '../services/dashboardService';
import { deleteTransaction } from '../services/transactionService';
import { useNotification } from '../context/NotificationContext';

const CATEGORY_COLORS = {
  Food: '#10b981',
  Shopping: '#f59e0b',
  Transport: '#3b82f6',
  Education: '#8b5cf6',
  Bills: '#ef4444',
  Entertainment: '#ec4899',
  Healthcare: '#06b6d4',
  Salary: '#10b981',
  Allowance: '#14b8a6',
  Scholarship: '#6366f1',
  Freelancing: '#84cc16',
  Other: '#64748b'
};

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'];

const Dashboard = () => {
  const { showSuccess, showError } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction._id);
      showSuccess('Transaction deleted successfully');
      setDeletingTransaction(null);
      fetchSummary();
    } catch (err) {
      showError(err.message || 'Failed to delete transaction');
    }
  };

  const totals = data?.totals || { income: 0, expenses: 0, balance: 0, transactionsCount: 0 };
  const currentMonthBudget = data?.currentMonth;
  const recentTransactions = data?.recentTransactions || [];
  const monthlyOverview = data?.monthlyOverview || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const spendingTrend = data?.spendingTrend || [];

  return (
    <div className="page-wrapper">
      {/* Page Title & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Financial Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Real-time financial summary, monthly cash flow, and spending analytics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchSummary}
            className="btn btn-secondary btn-sm"
            title="Refresh dashboard data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Income"
          amount={totals.income}
          type="income"
          icon={TrendingUp}
          subtext="Total earnings recorded"
        />
        <StatCard
          title="Total Expenses"
          amount={totals.expenses}
          type="expense"
          icon={TrendingDown}
          subtext="Total money spent"
        />
        <StatCard
          title="Available Balance"
          amount={totals.balance}
          type="balance"
          icon={Wallet}
          subtext={totals.balance >= 0 ? 'Healthy cash position' : 'Negative cash flow'}
        />
        <StatCard
          title="Total Transactions"
          amount={totals.transactionsCount}
          type="transactions"
          icon={ReceiptText}
          isCurrency={false}
          subtext="Total records in system"
        />
      </div>

      {/* Monthly Budget Glance Bar */}
      {currentMonthBudget && (
        <div className="card" style={{ marginBottom: '28px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PiggyBank size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Monthly Budget — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {currentMonthBudget.budget > 0
                    ? `₹${currentMonthBudget.spent.toLocaleString('en-IN')} spent of ₹${currentMonthBudget.budget.toLocaleString('en-IN')} limit`
                    : 'No spending limit set for this month'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {currentMonthBudget.budget > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Remaining</div>
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: currentMonthBudget.remaining >= 0 ? 'var(--income-green)' : 'var(--expense-red)'
                    }}
                  >
                    ₹{currentMonthBudget.remaining.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="btn btn-outline btn-sm"
              >
                {currentMonthBudget.budget > 0 ? 'Adjust Budget' : 'Set Budget'}
              </button>
            </div>
          </div>

          {currentMonthBudget.budget > 0 && (
            <>
              {/* Progress Bar */}
              <div className="progress-container">
                <div
                  className={`progress-bar-fill ${
                    currentMonthBudget.percentage >= 100
                      ? 'progress-danger'
                      : currentMonthBudget.percentage >= 80
                      ? 'progress-warning'
                      : 'progress-safe'
                  }`}
                  style={{ width: `${Math.min(currentMonthBudget.percentage, 100)}%` }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{currentMonthBudget.percentage}% used</span>
                <span>Limit: ₹{currentMonthBudget.budget.toLocaleString('en-IN')}</span>
              </div>

              {/* Alert Warning */}
              {currentMonthBudget.percentage >= 100 ? (
                <div className="alert-banner alert-danger" style={{ marginTop: '12px', marginBottom: 0 }}>
                  <AlertTriangle size={18} />
                  <span>
                    <strong>Alert:</strong> You have exceeded your monthly budget by ₹
                    {Math.abs(currentMonthBudget.remaining).toLocaleString('en-IN')}!
                  </span>
                </div>
              ) : currentMonthBudget.percentage >= 80 ? (
                <div className="alert-banner alert-warning" style={{ marginTop: '12px', marginBottom: 0 }}>
                  <AlertTriangle size={18} />
                  <span>
                    <strong>Warning:</strong> You have reached {currentMonthBudget.percentage}% of your monthly spending limit.
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* Visual Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Chart 1: Monthly Income vs Expenses (Bar Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart2 size={18} color="var(--primary)" />
                Monthly Cash Flow (Income vs Expenses)
              </h3>
              <span className="card-subtitle">Last 6 months comparison</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {monthlyOverview.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyOverview} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="shortName" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <p className="empty-state-desc">No transaction data available to plot chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Category-wise Expense (Pie/Donut Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieIcon size={18} color="var(--primary)" />
                Expense Breakdown by Category
              </h3>
              <span className="card-subtitle">Total distribution across expense categories</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <p className="empty-state-desc">No expense records yet to display category breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Spending Trend (Area Chart) */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <TrendingDown size={18} color="var(--expense-red)" />
              Monthly Spending Trend
            </h3>
            <span className="card-subtitle">Historical trajectory of outgoing expenses</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          {spendingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenses']}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Monthly Spending"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <p className="empty-state-desc">Record expenses to see your monthly spending curve</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <ReceiptText size={18} color="var(--primary)" />
              Recent Transactions
            </h3>
            <span className="card-subtitle">Latest 5 financial activities recorded in MongoDB</span>
          </div>

          <Link to="/transactions" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.title}</div>
                      {tx.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        className={`amount-cell ${
                          tx.type === 'income' ? 'amount-income' : 'amount-expense'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="btn-icon btn-secondary"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit transaction"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingTransaction(tx)}
                          className="btn-icon btn-danger"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ReceiptText size={28} />
            </div>
            <h4 className="empty-state-title">No transactions recorded yet</h4>
            <p className="empty-state-desc">
              Get started by adding your first income or expense to see live dashboard analytics!
            </p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Add First Transaction</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchSummary}
      />

      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        initialData={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={fetchSummary}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        itemName={deletingTransaction ? `${deletingTransaction.title} (₹${deletingTransaction.amount.toLocaleString('en-IN')})` : ''}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={fetchSummary}
        currentMonth={currentMonthBudget?.month}
        initialAmount={currentMonthBudget?.budget || ''}
      />
    </div>
  );
};

export default Dashboard;
