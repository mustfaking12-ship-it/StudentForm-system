import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع بعد الإتمام.',
  confirmText = 'نعم، تأكيد',
  cancelText = 'إلغاء',
  isDanger = false,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div
          style={{
            background: isDanger ? '#fef2f2' : '#fffbeb',
            color: isDanger ? '#dc2626' : '#d97706',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ fontSize: '0.98rem', color: '#334155', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'جاري المعالجة...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
