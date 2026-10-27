import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Tag, FileText, Check } from 'lucide-react';
import { createTransaction, updateTransaction } from '../services/transactionService';
import { useNotification } from '../context/NotificationContext';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Allowance',
  'Scholarship',
  'Freelancing',
  'Other'
];

const TransactionModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { showSuccess, showError } = useNotification();
  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || (initialData.type === 'income' ? 'Salary' : 'Food'),
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid positive amount';
    }

    if (!formData.category) {
      errs.category = 'Please select a category';
    }

    if (!formData.date) {
      errs.date = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        description: formData.description.trim()
      };

      if (isEditing) {
        await updateTransaction(initialData._id, payload);
        showSuccess('Transaction updated successfully!');
      } else {
        await createTransaction(payload);
        showSuccess(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: formData.type === 'income' ? 'var(--income-subtle)' : 'var(--expense-subtle)',
                color: formData.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {formData.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <span>{isEditing ? 'Edit Transaction' : 'Record New Transaction'}</span>
          </div>

          <button
            onClick={onClose}
            className="btn-icon btn-secondary"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type Toggle */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="type-toggle-group">
                <button
                  type="button"
                  className={`type-toggle-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => handleTypeChange('expense')}
                >
                  <TrendingDown size={17} />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  className={`type-toggle-btn ${formData.type === 'income' ? 'active income' : ''}`}
                  onClick={() => handleTypeChange('income')}
                >
                  <TrendingUp size={17} />
                  <span>Income</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Title <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Grocery shopping, Freelance payment..."
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
              </div>
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Amount & Date in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">
                  Amount (₹) <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="form-input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                {errors.amount && <span className="form-error">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            {/* Description (Optional) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Add notes, invoice number, or location details..."
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
              />
            </div>
          </div>

          {/* Modal Footer */}
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
              <span>{loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
