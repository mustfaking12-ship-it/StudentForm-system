import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'يرجى الاختيار...',
  required = false,
  error = '',
  hint = '',
  disabled = false,
  icon: Icon = null
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {Icon && <Icon size={16} color="var(--primary)" />}
          <span>{label}</span>
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        className={`form-control ${error ? 'is-invalid' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={val}>
              {label}
            </option>
          );
        })}
      </select>

      {error ? (
        <div className="form-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="form-hint">{hint}</div>
      ) : null}
    </div>
  );
}
