import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import QuadNameInput from '../common/QuadNameInput';

export default function StepGuardian({ formData, onChange, errors = {} }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم السادس: معلومات ولي الأمر والمسؤول القانوني</span>
        </div>
        <span className="section-badge">بيانات ولي الأمر</span>
      </div>

      <div className="grid-2">
        {/* IMPORTANT: Single Quad Name Field for Guardian */}
        <div style={{ gridColumn: 'span 2' }}>
          <QuadNameInput
            label="الاسم الرباعي لولي الأمر"
            name="guardian_quad_name"
            value={formData.guardian_quad_name}
            onChange={(e) => onChange('guardian_quad_name', e.target.value)}
            required={true}
            error={errors.guardian_quad_name}
            placeholder="مثال: حيدر جواد كاظم محمد"
          />
        </div>

        <SelectField
          label="صلة القرابة بالطالبة"
          name="guardian_relationship"
          value={formData.guardian_relationship || 'الأب'}
          onChange={(e) => onChange('guardian_relationship', e.target.value)}
          options={[
            { value: 'الأب', label: 'الأب' },
            { value: 'الأم', label: 'الأم' },
            { value: 'الأخ', label: 'الأخ' },
            { value: 'العم', label: 'العم' },
            { value: 'الخال', label: 'الخال' },
            { value: 'الجد', label: 'الجد' },
            { value: 'وصي قانوني', label: 'وصي قانوني بحكم محكمة' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
          required={true}
        />

        <InputField
          label="رقم هاتف ولي الأمر"
          name="guardian_phone"
          value={formData.guardian_phone}
          onChange={(e) => onChange('guardian_phone', e.target.value)}
          placeholder="مثال: 07701234567"
          required={true}
          error={errors.guardian_phone}
        />

        <InputField
          label="مهنة / وظيفة ولي الأمر"
          name="guardian_job"
          value={formData.guardian_job}
          onChange={(e) => onChange('guardian_job', e.target.value)}
          placeholder="مثال: مهندس، موظف حكومي، طبيب، كاسب..."
        />

        <InputField
          label="مكان عمل ولي الأمر (الدائرة / الشركة)"
          name="guardian_workplace"
          value={formData.guardian_workplace}
          onChange={(e) => onChange('guardian_workplace', e.target.value)}
          placeholder="مثال: وزارة التربية، وزارة الصحة..."
        />

        <InputField
          label="البريد الإلكتروني لولي الأمر"
          name="guardian_email"
          type="email"
          value={formData.guardian_email}
          onChange={(e) => onChange('guardian_email', e.target.value)}
          placeholder="parent@example.com"
        />

        <InputField
          label="عنوان سكن ولي الأمر (إن اختلف عن الطالبة)"
          name="guardian_address"
          value={formData.guardian_address}
          onChange={(e) => onChange('guardian_address', e.target.value)}
          placeholder="المحافظة - المنطقة"
        />
      </div>
    </div>
  );
}
