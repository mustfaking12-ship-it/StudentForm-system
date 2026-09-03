import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function StepIdDocs({ formData, onChange, errors = {} }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الثاني: معلومات الهوية والوثائق الرسمية</span>
        </div>
        <span className="section-badge">نظام EMIS</span>
      </div>

      <div className="grid-2">
        <SelectField
          label="نوع الوثيقة الثبوتية"
          name="id_type"
          value={formData.id_type || 'بطاقة وطنية موحدة'}
          onChange={(e) => onChange('id_type', e.target.value)}
          options={[
            { value: 'بطاقة وطنية موحدة', label: 'بطاقة وطنية موحدة (12 رقماً)' },
            { value: 'هوية أحوال مدنية', label: 'هوية أحوال مدنية (شهادة الجنسية)' },
            { value: 'جواز سفر', label: 'جواز سفر نافذ' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
          required={true}
        />

        <InputField
          label="رقم البطاقة الوطنية / الرقم الوطني"
          name="national_id"
          value={formData.national_id}
          onChange={(e) => onChange('national_id', e.target.value)}
          placeholder="مثال: 200512345678"
          hint="الرقم التعريفي المكون من 12 رقماً في البطاقة الموحدة"
        />

        <InputField
          label="رقم الوثيقة / رقم الهوية"
          name="id_number"
          value={formData.id_number}
          onChange={(e) => onChange('id_number', e.target.value)}
          placeholder="رقم الوثيقة الورقية أو الموحدة"
        />

        <InputField
          label="رقم السجل"
          name="record_number"
          value={formData.record_number}
          onChange={(e) => onChange('record_number', e.target.value)}
          placeholder="مثال: 142"
        />

        <InputField
          label="رقم الصحيفة"
          name="page_number"
          value={formData.page_number}
          onChange={(e) => onChange('page_number', e.target.value)}
          placeholder="مثال: 88"
        />

        <InputField
          label="الرقم العائلي"
          name="family_number"
          value={formData.family_number}
          onChange={(e) => onChange('family_number', e.target.value)}
          placeholder="مثال: 55412"
        />

        <InputField
          label="جهة إصدار الوثيقة (دائرة الأحوال)"
          name="id_issuer"
          value={formData.id_issuer}
          onChange={(e) => onChange('id_issuer', e.target.value)}
          placeholder="مثال: أحوال المنصور، أحوال الكرادة..."
        />

        <InputField
          label="تاريخ إصدار الوثيقة"
          name="id_issue_date"
          type="date"
          value={formData.id_issue_date}
          onChange={(e) => onChange('id_issue_date', e.target.value)}
        />
      </div>
    </div>
  );
}
