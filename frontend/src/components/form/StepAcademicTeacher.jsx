import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function StepAcademicTeacher({ formData, onChange, errors = {} }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم السادس: التحصيل الدراسي والشهادات للمدرس / الموظف</span>
        </div>
        <span className="section-badge">المؤهلات العلمية</span>
      </div>

      <div className="grid-2">
        <SelectField
          label="أعلى تحصيل دراسي"
          name="highest_degree"
          value={formData.highest_degree || 'بكالوريوس'}
          onChange={(e) => onChange('highest_degree', e.target.value)}
          options={[
            { value: 'دكتوراه', label: 'دكتوراه' },
            { value: 'ماجستير', label: 'ماجستير / ما يعادلها' },
            { value: 'دبلوم عالي', label: 'دبلوم عالي بعد البكالوريوس' },
            { value: 'بكالوريوس', label: 'بكالوريوس' },
            { value: 'دبلوم فني', label: 'دبلوم معهد (سنتان بعد الإعدادية)' },
            { value: 'إعدادية', label: 'شهادة الدراسة الإعدادية' },
            { value: 'متوسطة أو أقل', label: 'متوسطة أو أقل' }
          ]}
          required={true}
        />

        <InputField
          label="اسم الجامعة أو الكلية أو المعهد"
          name="university"
          value={formData.university}
          onChange={(e) => onChange('university', e.target.value)}
          placeholder="مثال: جامعة بغداد - كلية التربية ابن الهيثم"
        />

        <InputField
          label="اسم القسم"
          name="college_dept"
          value={formData.college_dept}
          onChange={(e) => onChange('college_dept', e.target.value)}
          placeholder="مثال: قسم الرياضيات، قسم الحاسوب..."
        />

        <InputField
          label="الاختصاص الدقيق"
          name="specialization"
          value={formData.specialization}
          onChange={(e) => onChange('specialization', e.target.value)}
          placeholder="مثال: طرائق تدريس، فيزياء نووية..."
        />

        <InputField
          label="سنة التخرج"
          name="grad_year"
          value={formData.grad_year}
          onChange={(e) => onChange('grad_year', e.target.value)}
          placeholder="مثال: 2012"
        />

        <InputField
          label="اسم الشهادة أو عنوان البحث"
          name="degree_name"
          value={formData.degree_name}
          onChange={(e) => onChange('degree_name', e.target.value)}
          placeholder="مثال: بكالوريوس في علوم الحياة"
        />

        <div style={{ gridColumn: 'span 2' }}>
          <InputField
            label="الدورات التدريبية والتطويرية"
            name="training_courses"
            value={formData.training_courses}
            onChange={(e) => onChange('training_courses', e.target.value)}
            placeholder="مثال: دورات التكنولوجيا في التعليم، القيادة المدرسية، دورات وزارة التربية..."
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <InputField
            label="ملاحظات إضافية"
            name="notes"
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="أي معلومات إضافية ترغب في إضافتها..."
          />
        </div>
      </div>
    </div>
  );
}
