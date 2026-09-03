import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="alert" aria-live="assertive">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        const icons = {
          success: <CheckCircle2 size={20} color="#059669" />,
          warning: <AlertTriangle size={20} color="#d97706" />,
          danger: <XCircle size={20} color="#dc2626" />,
          info: <Info size={20} color="#0284c7" />
        };

        return (
          <div key={toast.id} className={`toast toast-${type}`}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {icons[type]}
            </div>
            <div style={{ flex: 1 }}>
              {toast.title && <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>{toast.title}</div>}
              <div style={{ fontSize: '0.86rem', color: '#334155' }}>{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
              aria-label="إغلاق التنبيه"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
