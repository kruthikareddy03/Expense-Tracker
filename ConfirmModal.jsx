import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--expense-red)' }}>
            <AlertTriangle size={20} />
            <span>{title || 'Confirm Deletion'}</span>
          </div>
          <button
            onClick={onClose}
            className="btn-icon btn-secondary"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '12px' }}>
            {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
          </p>
          {itemName && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: 'var(--text-main)'
              }}
            >
              {itemName}
            </div>
          )}
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
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
