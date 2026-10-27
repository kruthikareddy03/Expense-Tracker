import React, { useState, useEffect } from 'react';
import { PiggyBank, X, Check } from 'lucide-react';
import { setBudget } from '../services/budgetService';
import { useNotification } from '../context/NotificationContext';

const BudgetModal = ({ isOpen, onClose, onSuccess, currentMonth, initialAmount = '' }) => {
  const { showSuccess, showError } = useNotification();
  const [month, setMonth] = useState(currentMonth || new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState(initialAmount || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentMonth) setMonth(currentMonth);
    if (initialAmount) setAmount(initialAmount);
    setError('');
  }, [currentMonth, initialAmount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid monthly budget limit greater than ₹0');
      return;
    }

    setLoading(true);
    try {
      await setBudget({
        month,
        amount: numAmount,
        notes: notes.trim()
      });
      showSuccess(`Budget set to ₹${numAmount.toLocaleString('en-IN')} for ${month}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save monthly budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PiggyBank size={18} />
            </div>
            <span>Set Monthly Spending Limit</span>
          </div>

          <button
            onClick={onClose}
            className="btn-icon btn-secondary"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Target Month <span className="req">*</span>
              </label>
              <input
                type="month"
                className="form-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Spending Limit (₹) <span className="req">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 25000"
                className="form-input"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                required
              />
              {error && <span className="form-error">{error}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Budget Notes / Goals (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Save ₹5,000 for emergency fund, limit dining out..."
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Check size={16} />
              <span>{loading ? 'Saving...' : 'Save Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
