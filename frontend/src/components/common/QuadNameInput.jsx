import React from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

export default function QuadNameInput({
  label = 'الاسم الرباعي',
  name = 'quad_name',
  value = '',
  onChange,
  required = true,
  error = '',
  placeholder = 'مثال: مصطفى حسن جاسم محمد',
  disabled = false
}) {
  // Count words
  const words = (value || '').trim().split(/\s+/).filter(w => w.length > 0);
  const wordsCount = words.length;

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={name} className="form-label">
          <User size={16} color="var(--primary)" />
          <span>{label}</span>
          {required && <span className="required-star">*</span>}
        </label>

        {value && (
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: wordsCount >= 4 ? '#ecfdf5' : '#fffbeb',
              color: wordsCount >= 4 ? '#059669' : '#d97706',
              border: `1px solid ${wordsCount >= 4 ? '#a7f3d0' : '#fde68a'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {wordsCount >= 4 ? (
              <>
                <CheckCircle size={12} />
                <span>رباعي مكتمل ({wordsCount} كلمات)</span>
              </>
            ) : (
              <>
                <span>{wordsCount} من 4 أسماء</span>
              </>
            )}
          </span>
        )}
      </div>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-control ${error ? 'is-invalid' : wordsCount >= 4 ? 'is-valid' : ''}`}
        style={{ fontSize: '1rem', fontWeight: 500 }}
      />

      {error ? (
        <div className="form-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="form-hint" style={{ color: '#64748b' }}>
          حقل موحد للاسم الكامل: اكتب الاسم الرباعي مفصولاً بمسافات (مثل: مصطفى حسن جاسم محمد)
        </div>
      )}
    </div>
  );
}
