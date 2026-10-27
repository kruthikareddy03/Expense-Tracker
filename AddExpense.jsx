import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Check,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { createTransaction } from '../services/transactionService';
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

const AddExpense = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

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

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
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
      errs.amount = 'Amount must be a positive number greater than 0';
    }

    if (!formData.category) {
      errs.category = 'Category is required';
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
      await createTransaction({
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        description: formData.description.trim()
      });

      showSuccess(`${formData.type === 'income' ? 'Income' : 'Expense'} record added successfully!`);
      navigate('/transactions');
    } catch (err) {
      showError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setErrors({});
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '10px' }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <h1 className="page-title">
            <PlusCircle size={26} color="var(--primary)" />
            <span>Add Transaction</span>
          </h1>
          <p className="page-subtitle">
            Record a new income entry or expense with categorization and notes
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Segmented Type Toggle */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '0.92rem' }}>
              Select Transaction Type
            </label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <TrendingDown size={19} />
                <span>Expense (Money Out)</span>
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <TrendingUp size={19} />
                <span>Income (Money In)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Transaction Title <span className="req">*</span>
            </label>
            <input
              type="text"
              placeholder={formData.type === 'expense' ? 'e.g. Grocery store, College tuition fee...' : 'e.g. Monthly salary, Freelance design...'}
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Amount and Date in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Amount (₹) <span className="req">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
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

          {/* Category */}
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

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Description / Notes (Optional)</label>
            <textarea
              rows={4}
              placeholder="Add optional notes, invoice breakdown, or context..."
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={15} />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '150px' }}
            >
              <Check size={16} />
              <span>{loading ? 'Submitting...' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
