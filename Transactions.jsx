import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Calendar,
  Edit2,
  Trash2,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { getTransactions, deleteTransaction } from '../services/transactionService';
import TransactionModal, { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const Transactions = () => {
  const { showSuccess, showError } = useNotification();

  // State for data
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ filteredIncome: 0, filteredExpense: 0, filteredNet: 0 });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const fetchTransactionsList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order
      };

      if (search.trim()) params.search = search.trim();
      if (type !== 'all') params.type = type;
      if (category !== 'All') params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getTransactions(params);
      if (res.success) {
        setTransactions(res.data);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, search, type, category, startDate, endDate, showError]);

  useEffect(() => {
    fetchTransactionsList();
  }, [fetchTransactionsList]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction._id);
      showSuccess('Transaction deleted successfully');
      setDeletingTransaction(null);
      fetchTransactionsList();
    } catch (err) {
      showError(err.message || 'Failed to delete transaction');
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      showError('No transactions available to export');
      return;
    }

    const headers = ['Title', 'Amount (₹)', 'Type', 'Category', 'Date', 'Description'];
    const rows = transactions.map((t) => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category}"`,
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_expense_tracker_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Exported transactions to CSV successfully');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ReceiptText size={26} color="var(--primary)" />
            <span>Transaction Management</span>
          </h1>
          <p className="page-subtitle">
            Search, filter, view, edit, and organize all your financial transactions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={exportToCSV} className="btn btn-secondary btn-sm" title="Download CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Search by title/description */}
          <div style={{ position: 'relative' }}>
            <Search
              size={17}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            />
            <input
              type="text"
              placeholder="Search by title or notes..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="form-select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="form-select"
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Date Range:
            </span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.84rem' }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.84rem' }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />

            {(search || type !== 'all' || category !== 'All' || startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 10px' }}
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Filtered Totals Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Filtered Income: </span>
              <strong style={{ color: 'var(--income-green)' }}>
                ₹{(summary.filteredIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Filtered Expenses: </span>
              <strong style={{ color: 'var(--expense-red)' }}>
                ₹{(summary.filteredExpense || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Loading transactions from MongoDB...
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Title & Notes</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.title}</div>
                        {tx.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', maxWidth: '300px' }}>
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-category">{tx.category}</span>
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
                        <span className={`amount-cell ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
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

            {/* Pagination footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '18px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-light)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Showing <strong>{(page - 1) * limit + 1}</strong> to{' '}
                <strong>{Math.min(page * limit, totalCount)}</strong> of <strong>{totalCount}</strong> transactions
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <span style={{ fontSize: '0.84rem', padding: '0 8px', fontWeight: 600 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ReceiptText size={30} />
            </div>
            <h4 className="empty-state-title">No transactions match your criteria</h4>
            <p className="empty-state-desc">
              Try adjusting your search query, clearing filters, or adding a new transaction.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                Reset All Filters
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>Record Transaction</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTransactionsList}
      />

      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        initialData={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={fetchTransactionsList}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        itemName={deletingTransaction ? `${deletingTransaction.title} (₹${deletingTransaction.amount.toLocaleString('en-IN')})` : ''}
      />
    </div>
  );
};

export default Transactions;
