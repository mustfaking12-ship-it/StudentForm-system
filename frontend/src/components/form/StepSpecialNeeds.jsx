import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function StepSpecialNeeds({ formData, onChange }) {
  const hasNeeds = formData.has_special_needs === 1 || formData.has_special_needs === true;

  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الرابع: ذوو الاحتياجات الخاصة والرعاية الصحية</span>
        </div>
        <span className="section-badge">رعاية ومتابعة</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          هل توجد احتياجات خاصة أو حالات صحية تتطلب رعاية؟
        </label>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="radio"
              name="has_special_needs"
              checked={!hasNeeds}
              onChange={() => onChange('has_special_needs', 0)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>لا يوجد</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: hasNeeds ? 'var(--primary)' : 'inherit' }}>
            <input
              type="radio"
              name="has_special_needs"
              checked={hasNeeds}
              onChange={() => onChange('has_special_needs', 1)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>يوجد</span>
          </label>
        </div>
      </div>

      {hasNeeds && (
        <div
          style={{
            background: 'var(--bg-alt)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-color)',
            animation: 'slideIn 0.25s ease'
          }}
        >
          <div className="grid-2">
            <SelectField
              label="نوع الاحتياج / الحالة"
              name="special_needs_type"
              value={formData.special_needs_type}
              onChange={(e) => onChange('special_needs_type', e.target.value)}
              options={[
                { value: 'بصري', label: 'إعاقة بصرية / ضعف بصر شديد' },
                { value: 'سمعي', label: 'إعاقة سمعية / ضعف سمع' },
                { value: 'حركي', label: 'إعاقة حركية / صعوبة تنقل' },
                { value: 'نطقي', label: 'صعوبات نطق وتخاطب' },
                { value: 'صحي مزمن', label: 'مرض مزمن (سكري، ربو، قلب...)' },
                { value: 'أخرى', label: 'أخرى' }
              ]}
              placeholder="حدد نوع الاحتياج..."
            />

            <SelectField
              label="درجة الاحتياج"
              name="special_needs_level"
              value={formData.special_needs_level}
              onChange={(e) => onChange('special_needs_level', e.target.value)}
              options={[
                { value: 'بسيط', label: 'بسيط (يحتاج ترتيب مقعد أو متابعة خفيفة)' },
                { value: 'متوسط', label: 'متوسط (يحتاج مساعدة ومراعاة خاصة)' },
                { value: 'شديد', label: 'شديد (يحتاج مرافق أو رعاية خاصة متواصلة)' }
              ]}
              placeholder="حدد درجة الاحتياج..."
            />

            <div style={{ gridColumn: 'span 2' }}>
              <InputField
                label="تفاصيل الحالة أو التوصيات الطبية"
                name="special_needs_details"
                value={formData.special_needs_details}
                onChange={(e) => onChange('special_needs_details', e.target.value)}
                placeholder="يرجى كتابة التفاصيل لمساعدة المدرسة في تقديم الدعم المناسب..."
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <InputField
                label="ملاحظات إضافية"
                name="special_needs_notes"
                value={formData.special_needs_notes}
                onChange={(e) => onChange('special_needs_notes', e.target.value)}
                placeholder="أي ملاحظات موجهة لإدارة المدرسة والملاكات التدريسية"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
