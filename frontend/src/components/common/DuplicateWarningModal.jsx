import React from 'react';
import { AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import Modal from './Modal';

export default function DuplicateWarningModal({
  isOpen,
  onClose,
  onProceed,
  onViewExisting,
  matchedRecord,
  message
}) {
  if (!matchedRecord) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تنبيه: اشتباه في تكرار السجل">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#fffbeb',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}
        >
          <AlertCircle size={36} />
        </div>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>
          قد يكون هذا الشخص مسجلاً مسبقاً!
        </h4>
        <p style={{ fontSize: '0.92rem', color: '#475569' }}>
          {message || 'عثر النظام على سجل سابق يتطابق مع البيانات المدخلة حالياً.'}
        </p>
      </div>

      <div
        style={{
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.92rem'
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          تفاصيل السجل المتطابق في النظام:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div>
            <strong>الرمز:</strong> {matchedRecord.code}
          </div>
          <div>
            <strong>الاسم:</strong> {matchedRecord.quad_name}
          </div>
          <div>
            <strong>تاريخ التولد:</strong> {matchedRecord.dob || '-'}
          </div>
          <div>
            <strong>الهاتف:</strong> {matchedRecord.phone || '-'}
          </div>
          {matchedRecord.grade && (
            <div>
              <strong>الصف:</strong> {matchedRecord.grade}
            </div>
          )}
          {matchedRecord.job_title && (
            <div>
              <strong>الوظيفة:</strong> {matchedRecord.job_title}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {onViewExisting && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onViewExisting(matchedRecord.id)}
          >
            <Eye size={16} />
            معاينة السجل الموجود
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            مراجعة البيانات وتعديلها
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onProceed}
          >
            المتابعة على أية حال
          </button>
        </div>
      </div>
    </Modal>
  );
}
