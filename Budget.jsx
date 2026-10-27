import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit3,
  HelpCircle
} from 'lucide-react';
import { getBudgetStatus, setBudget, getBudgets } from '../services/budgetService';
import BudgetModal from '../components/BudgetModal';
import { useNotification } from '../context/NotificationContext';

const Budget = () => {
  const { showSuccess, showError } = useNotification();

  // Current selected month
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [budgetData, setBudgetData] = useState(null);
  const [allBudgets, setAllBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBudgetDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, listRes] = await Promise.all([
        getBudgetStatus(selectedMonth),
        getBudgets()
      ]);

      if (statusRes.success) {
        setBudgetData(statusRes.data);
      }
      if (listRes.success) {
        setAllBudgets(listRes.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch budget status');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, showError]);

  useEffect(() => {
    fetchBudgetDetails();
  }, [fetchBudgetDetails]);

  const budgetAmount = budgetData?.budgetAmount || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const remaining = budgetData?.remaining || 0;
  const percentageUsed = budgetData?.percentageUsed || 0;
  const status = budgetData?.status || 'not_set';
  const hasBudget = budgetData?.hasBudget || false;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthFormatted = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <PiggyBank size={26} color="var(--primary)" />
            <span>Monthly Budget Management</span>
          </h1>
          <p className="page-subtitle">
            Set and track spending limits with real-time threshold warnings and alerts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Month Selector */}
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

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Edit3 size={15} />
            <span>{hasBudget ? 'Edit Budget' : 'Set Budget'}</span>
          </button>
        </div>
      </div>

      {/* Main Budget Status Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Budget Overview
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px' }}>
              {monthFormatted}
            </h2>
          </div>

          <div>
            {hasBudget ? (
              <span
                className="badge"
                style={{
                  fontSize: '0.84rem',
                  padding: '6px 14px',
                  backgroundColor:
                    status === 'exceeded'
                      ? 'var(--expense-subtle)'
                      : status === 'warning'
                      ? 'var(--warning-subtle)'
                      : 'var(--income-subtle)',
                  color:
                    status === 'exceeded'
                      ? 'var(--expense-red)'
                      : status === 'warning'
                      ? 'var(--warning-amber)'
                      : 'var(--income-green)',
                  border: `1px solid ${
                    status === 'exceeded'
                      ? 'var(--expense-border)'
                      : status === 'warning'
                      ? 'var(--warning-border)'
                      : 'var(--income-border)'
                  }`
                }}
              >
                {status === 'exceeded'
                  ? 'Exceeded Budget'
                  : status === 'warning'
                  ? 'Warning: Near Limit'
                  : 'On Track'}
              </span>
            ) : (
              <span className="badge badge-category" style={{ fontSize: '0.84rem', padding: '6px 14px' }}>
                No Budget Configured
              </span>
            )}
          </div>
        </div>

        {/* 4 Metrics in a row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '26px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Monthly Limit
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              ₹{budgetAmount.toLocaleString('en-IN')}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Spent
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--expense-red)', marginTop: '4px' }}>
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Remaining Budget
            </div>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: remaining >= 0 ? 'var(--income-green)' : 'var(--expense-red)',
                marginTop: '4px'
              }}
            >
              ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Budget Utilized
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {percentageUsed}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        {hasBudget ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
              <span>Progress towards spending threshold</span>
              <span style={{ color: percentageUsed >= 100 ? 'var(--expense-red)' : percentageUsed >= 80 ? 'var(--warning-amber)' : 'var(--income-green)' }}>
                {percentageUsed}% used
              </span>
            </div>

            <div className="progress-container" style={{ height: '16px' }}>
              <div
                className={`progress-bar-fill ${
                  percentageUsed >= 100
                    ? 'progress-danger'
                    : percentageUsed >= 80
                    ? 'progress-warning'
                    : 'progress-safe'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>

            {/* Threshold Notification Banners */}
            {percentageUsed >= 100 ? (
              <div className="alert-banner alert-danger" style={{ marginTop: '20px' }}>
                <AlertTriangle size={20} />
                <div>
                  <strong>Budget Exceeded Alert:</strong> You have spent 100% or more of your allocated budget for{' '}
                  {monthFormatted}. You are currently over budget by ₹{Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
                </div>
              </div>
            ) : percentageUsed >= 80 ? (
              <div className="alert-banner alert-warning" style={{ marginTop: '20px' }}>
                <AlertTriangle size={20} />
                <div>
                  <strong>Spending Warning:</strong> You have consumed {percentageUsed}% of your budget limit. Only ₹
                  {remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining for the rest of {monthFormatted}.
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  color: 'var(--income-green)'
                }}
              >
                <CheckCircle size={16} />
                <span>You are safely within your budget limit for this month.</span>
              </div>
            )}

            {budgetData?.notes && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                  color: 'var(--text-muted)'
                }}
              >
                <strong>Goal / Note:</strong> {budgetData.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <p className="empty-state-desc">
              You haven't defined a monthly budget for {monthFormatted}. Setting a limit helps you prevent overspending!
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Set Spending Limit for {monthFormatted}</span>
            </button>
          </div>
        )}
      </div>

      {/* Previously Set Budgets Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={18} color="var(--primary)" />
            Configured Monthly Budgets History
          </h3>
        </div>

        {allBudgets.length > 0 ? (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Spending Limit</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allBudgets.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.month}</strong>
                    </td>
                    <td>
                      <span className="badge badge-category">{b.category || 'Overall'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {b.notes || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedMonth(b.month);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No saved monthly budgets found. Set your first budget above!
          </p>
        )}
      </div>

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgetDetails}
        currentMonth={selectedMonth}
        initialAmount={budgetAmount || ''}
      />
    </div>
  );
};

export default Budget;
