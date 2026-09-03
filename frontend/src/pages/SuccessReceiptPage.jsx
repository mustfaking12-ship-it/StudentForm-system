import React from 'react';
import { CheckCircle2, Printer, Home, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SuccessReceiptPage({ record, type = 'student', onPrintA4, onGoHome }) {
  if (!record) return null;

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', textAlign: 'center' }}>
      <div className="form-card" style={{ padding: '3rem 2rem' }}>
        {/* Success Icon */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 0 10px rgba(5, 150, 105, 0.1)'
          }}
        >
          <CheckCircle2 size={52} strokeWidth={2.5} />
        </div>

        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          تم تسجيل واعتماد الاستمارة بنجاح!
        </h2>

        <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '2rem' }}>
          تم حفظ البيانات في السجل الإلكتروني لمدرسة المتفوقات الأولى للبنات بنظام EMIS الوزاري.
        </p>

        {/* Issued Code Badge Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '2px dashed var(--accent-gold)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
            الرمز التعريفي الصادر (يرجى الاحتفاظ به للمراجعة):
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--primary)',
              fontFamily: 'monospace',
              letterSpacing: '2px',
              direction: 'ltr'
            }}
          >
            {record.code}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.25rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>الاسم الرباعي: </span>
              <strong>{record.quad_name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>تاريخ التسجيل: </span>
              <strong>{new Date(record.created_at || Date.now()).toLocaleDateString('ar-IQ')}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px', margin: '0 auto' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onPrintA4(record, type)}
          >
            <Printer size={20} />
            <span>طباعة الاستمارة الرسمية A4</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onGoHome}
          >
            <Home size={18} />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
}
