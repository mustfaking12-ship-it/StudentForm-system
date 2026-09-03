import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function StepContactAddress({ formData, onChange, errors = {}, isTeacher = false }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الثالث: معلومات الاتصال وعنوان السكن</span>
        </div>
        <span className="section-badge">بيانات التواصل</span>
      </div>

      <div className="grid-2">
        <InputField
          label="رقم الهاتف الأساسي"
          name="phone"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="مثال: 07701234567"
          required={true}
          error={errors.phone}
          hint="رقم الهاتف الفعال للتواصل واستلام الإشعارات"
        />

        <InputField
          label="رقم هاتف إضافي / أرضي"
          name="alt_phone"
          value={formData.alt_phone}
          onChange={(e) => onChange('alt_phone', e.target.value)}
          placeholder="مثال: 07801234567"
        />

        <InputField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="example@domain.com"
        />

        <SelectField
          label="نوع السكن"
          name="housing_type"
          value={formData.housing_type || 'ملك'}
          onChange={(e) => onChange('housing_type', e.target.value)}
          options={[
            { value: 'ملك', label: 'ملك صرف' },
            { value: 'إيجار', label: 'إيجار' },
            { value: 'حكومي', label: 'سكن وظيفي / حكومي' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
        />

        <InputField
          label="المدينة / المنطقة / الحي"
          name="neighborhood"
          value={formData.neighborhood}
          onChange={(e) => onChange('neighborhood', e.target.value)}
          placeholder="مثال: المنصور، اليرموك، زيونة..."
        />

        <InputField
          label="المحلة"
          name="mahalla"
          value={formData.mahalla}
          onChange={(e) => onChange('mahalla', e.target.value)}
          placeholder="مثال: 611"
        />

        <InputField
          label="الزقاق"
          name="zuqaq"
          value={formData.zuqaq}
          onChange={(e) => onChange('zuqaq', e.target.value)}
          placeholder="مثال: 14"
        />

        <InputField
          label="رقم الدار / عنوان 1"
          name="house_no"
          value={formData.house_no}
          onChange={(e) => onChange('house_no', e.target.value)}
          placeholder="مثال: 22"
        />

        <InputField
          label="أقرب نقطة دالة"
          name="landmark"
          value={formData.landmark}
          onChange={(e) => onChange('landmark', e.target.value)}
          placeholder="مثال: قرب جامع الشواف، مجاور مستشفى..."
        />

        <InputField
          label="العنوان بالتفصيل"
          name="address_details"
          value={formData.address_details}
          onChange={(e) => onChange('address_details', e.target.value)}
          placeholder="مثال: بغداد - الكرخ - اليرموك - محلة 611 زقاق 14 دار 22"
        />

        {/* Emergency contact info */}
        <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.85rem' }}>
            جهة الاتصال في حالات الطوارئ:
          </h4>
          <div className="grid-3">
            <InputField
              label="اسم جهة الاتصال للطوارئ"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => onChange('emergency_contact_name', e.target.value)}
              placeholder="الاسم الثلاثي"
            />
            <InputField
              label="صلة القرابة"
              name="emergency_relationship"
              value={formData.emergency_relationship}
              onChange={(e) => onChange('emergency_relationship', e.target.value)}
              placeholder="مثال: الأب، الأخ، الزوج..."
            />
            <InputField
              label="رقم هاتف الطوارئ"
              name="emergency_phone"
              value={formData.emergency_phone}
              onChange={(e) => onChange('emergency_phone', e.target.value)}
              placeholder="07XXXXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
