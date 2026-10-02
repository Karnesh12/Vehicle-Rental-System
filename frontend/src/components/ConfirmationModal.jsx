import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmType = 'danger',
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div style={{
              backgroundColor: confirmType === 'danger' ? 'var(--color-rose-50)' : 'var(--color-blue-50)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              color: confirmType === 'danger' ? 'var(--color-rose-600)' : 'var(--color-blue-600)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmType}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
