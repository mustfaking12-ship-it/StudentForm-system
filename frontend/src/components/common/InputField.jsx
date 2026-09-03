import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
  hint = '',
  disabled = false,
  icon: Icon = null,
  min,
  max,
  step
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

      <div style={{ position: 'relative' }}>
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`form-control ${error ? 'is-invalid' : ''}`}
        />
      </div>

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
