import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

const GRADES = [
  'الأول متوسط',
  'الثاني متوسط',
  'الثالث متوسط',
  'الرابع العلمي',
  'الخامس العلمي',
  'السادس العلمي'
];

const SECTIONS = ['أ', 'ب', 'ج', 'د', 'هـ'];

export default function StepAcademicStudent({ formData, onChange, errors = {} }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الخامس: المعلومات الدراسية للطالبة</span>
        </div>
        <span className="section-badge">مدرسة المتفوقات الأولى للبنات</span>
      </div>

      <div className="grid-3">
        <SelectField
          label="الصف الدراسي"
          name="grade"
          value={formData.grade}
          onChange={(e) => {
            const val = e.target.value;
            onChange('grade', val);
            if (val.includes('متوسط')) {
              onChange('study_stage', 'المتوسطة');
            } else if (val.includes('العلمي') || val.includes('الإعدادي')) {
              onChange('study_stage', 'الإعدادية');
            }
          }}
          options={GRADES}
          required={true}
          error={errors.grade}
          placeholder="اختر الصف الدراسي..."
        />

        <SelectField
          label="الشعبة"
          name="section"
          value={formData.section}
          onChange={(e) => onChange('section', e.target.value)}
          options={SECTIONS}
          required={true}
          error={errors.section}
          placeholder="اختر الشعبة..."
        />

        <SelectField
          label="المرحلة الدراسية"
          name="study_stage"
          value={formData.study_stage || 'المتوسطة'}
          onChange={(e) => onChange('study_stage', e.target.value)}
          options={[
            { value: 'المتوسطة', label: 'المرحلة المتوسطة' },
            { value: 'الإعدادية', label: 'المرحلة الإعدادية' }
          ]}
        />

        <SelectField
          label="نوع الدراسة"
          name="study_type"
          value={formData.study_type || 'صباحي'}
          onChange={(e) => onChange('study_type', e.target.value)}
          options={[
            { value: 'صباحي', label: 'صباحي (دوام رسمي)' },
            { value: 'مسائي', label: 'مسائي' },
            { value: 'أهلي', label: 'أهلي' }
          ]}
        />

        <InputField
          label="سنة القبول في المدرسة"
          name="admission_year"
          value={formData.admission_year}
          onChange={(e) => onChange('admission_year', e.target.value)}
          placeholder="مثال: 2023"
        />

        <InputField
          label="سنة الالتحاق الحالية"
          name="enrollment_year"
          value={formData.enrollment_year}
          onChange={(e) => onChange('enrollment_year', e.target.value)}
          placeholder="مثال: 2024"
        />

        <InputField
          label="المدرسة السابقة"
          name="previous_school"
          value={formData.previous_school}
          onChange={(e) => onChange('previous_school', e.target.value)}
          placeholder="اسم المدرسة الابتدائية أو المتوسطة السابقة"
        />

        <InputField
          label="المعدل الدراسي السابق / التنافسي"
          name="gpa"
          type="number"
          step="0.01"
          value={formData.gpa}
          onChange={(e) => onChange('gpa', e.target.value)}
          placeholder="مثال: 98.5"
          hint="معدل القبول أو الدرجات التنافسية لمدارس المتفوقين"
        />

        <SelectField
          label="حالة الطالبة الحالية"
          name="student_status"
          value={formData.student_status || 'مستمرة'}
          onChange={(e) => onChange('student_status', e.target.value)}
          options={[
            { value: 'مستمرة', label: 'مستمرة بالدوام' },
            { value: 'منقولة', label: 'منقولة إلى مدرسة أخرى' },
            { value: 'متخرجة', label: 'متخرجة' },
            { value: 'مفصولة', label: 'مفصولة' },
            { value: 'متوقفة', label: 'متوقفة / مؤجلة' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
        />

        <InputField
          label="الرقم المدرسي"
          name="student_school_id"
          value={formData.student_school_id}
          onChange={(e) => onChange('student_school_id', e.target.value)}
          placeholder="مثال: 2023/101"
        />

        <InputField
          label="رقم الملف الورقي / الأضبارة"
          name="file_number"
          value={formData.file_number}
          onChange={(e) => onChange('file_number', e.target.value)}
          placeholder="مثال: F-2023-01"
        />

        <div style={{ gridColumn: 'span 3' }}>
          <InputField
            label="ملاحظات دراسية أو مواهب وتفوق"
            name="academic_notes"
            value={formData.academic_notes}
            onChange={(e) => onChange('academic_notes', e.target.value)}
            placeholder="مثال: تفوق في أولمبياد الرياضيات، إتقان لغات أجنبية، مشاركات علمية..."
          />
        </div>
      </div>
    </div>
  );
}
