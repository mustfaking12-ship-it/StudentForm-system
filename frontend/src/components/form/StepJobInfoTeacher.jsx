import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function StepJobInfoTeacher({ formData, onChange, errors = {} }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الخامس: المعلومات الوظيفية والمهنية</span>
        </div>
        <span className="section-badge">استمارة EMIS الرسمية</span>
      </div>

      <div className="grid-3">
        <SelectField
          label="نوع التوظيف"
          name="employment_type"
          value={formData.employment_type || 'ملاك دائم'}
          onChange={(e) => onChange('employment_type', e.target.value)}
          options={[
            { value: 'ملاك دائم', label: 'ملاك دائم (مثبت)' },
            { value: 'عقد', label: 'عقد وزاري' },
            { value: 'محاضر', label: 'محاضر مجاني / ملحق' },
            { value: 'أجير', label: 'أجير يومي' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
          required={true}
          error={errors.employment_type}
        />

        <SelectField
          label="نوع الموظف / الكادر"
          name="staff_category"
          value={formData.staff_category || 'تدريسي'}
          onChange={(e) => onChange('staff_category', e.target.value)}
          options={[
            { value: 'تدريسي', label: 'تدريسي / معلم / مدرس' },
            { value: 'إداري', label: 'إداري' },
            { value: 'فني', label: 'فني مختبرات / حاسوب' },
            { value: 'خدمي', label: 'خدمي / مستخدم' },
            { value: 'حارس', label: 'حارس أمني' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
          required={true}
          error={errors.staff_category}
        />

        <SelectField
          label="الحالة الوظيفية"
          name="employment_status"
          value={formData.employment_status || 'مستمر'}
          onChange={(e) => onChange('employment_status', e.target.value)}
          options={[
            { value: 'مستمر', label: 'مستمر بالخدمة' },
            { value: 'إجازة دراسية/أمومة', label: 'إجازة دراسية / أمومة / مرضية' },
            { value: 'متقاعد', label: 'متقاعد' },
            { value: 'مفصول', label: 'مفصول / مستقيل' },
            { value: 'متوفي', label: 'متوفي' }
          ]}
        />

        <InputField
          label="المسمى الوظيفي"
          name="job_title"
          value={formData.job_title}
          onChange={(e) => onChange('job_title', e.target.value)}
          placeholder="مثال: مدرسة كيمياء، معاونة مديرة، أمينة مكتبة..."
        />

        <SelectField
          label="المنصب الحالي بالمدرسة"
          name="job_position"
          value={formData.job_position || 'مدرس'}
          onChange={(e) => onChange('job_position', e.target.value)}
          options={[
            { value: 'مدير', label: 'مديرة المدرسة' },
            { value: 'معاون', label: 'معاونة شؤون الطلبة / الإدارة' },
            { value: 'مدرس', label: 'مدرسة / معلمة' },
            { value: 'إداري', label: 'موظفة إدارة / تسجيل' },
            { value: 'مشرف', label: 'مشرفة تربوية مقيمة' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
        />

        <SelectField
          label="التصنيف"
          name="classification"
          value={formData.classification || 'مدرس'}
          onChange={(e) => onChange('classification', e.target.value)}
          options={[
            { value: 'مدرس', label: 'مدرس' },
            { value: 'معلم', label: 'معلم' },
            { value: 'موظف', label: 'موظف' }
          ]}
        />

        <InputField
          label="العنوان الوظيفي"
          name="job_official_title"
          value={formData.job_official_title}
          onChange={(e) => onChange('job_official_title', e.target.value)}
          placeholder="مثال: رئيس أبحاث، مدرس أول، كاتب طابعة..."
        />

        <InputField
          label="الدرجة الوظيفية / المرحلة"
          name="job_grade"
          value={formData.job_grade}
          onChange={(e) => onChange('job_grade', e.target.value)}
          placeholder="مثال: الأولى، الثانية، الرابعة..."
        />

        <InputField
          label="القسم / الشعبة الإدارية"
          name="department"
          value={formData.department}
          onChange={(e) => onChange('department', e.target.value)}
          placeholder="مثال: قسم اللغة الإنجليزية، شعبة الإدارة..."
        />

        <InputField
          label="المادة التي يدرسها"
          name="subject_taught"
          value={formData.subject_taught}
          onChange={(e) => onChange('subject_taught', e.target.value)}
          placeholder="مثال: الرياضيات، الفيزياء، اللغة العربية..."
        />

        <InputField
          label="المراحل التي يدرسها"
          name="stages_taught"
          value={formData.stages_taught}
          onChange={(e) => onChange('stages_taught', e.target.value)}
          placeholder="مثال: الثالث متوسط، الخامس والسادس العلمي..."
        />

        <InputField
          label="اسم المدرسة الحالية"
          name="school_name"
          value={formData.school_name || 'مدرسة المتفوقات الأولى للبنات'}
          onChange={(e) => onChange('school_name', e.target.value)}
        />

        <InputField
          label="تاريخ أول تعيين رسمي"
          name="first_appointment_date"
          type="date"
          value={formData.first_appointment_date}
          onChange={(e) => onChange('first_appointment_date', e.target.value)}
        />

        <InputField
          label="تاريخ المباشرة في المدرسة"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => onChange('start_date', e.target.value)}
        />

        <InputField
          label="الرقم الوظيفي الوزاري"
          name="job_number"
          value={formData.job_number}
          onChange={(e) => onChange('job_number', e.target.value)}
          placeholder="مثال: EMP-10492"
        />

        <InputField
          label="رقم الملف الوظيفي (الأضبارة)"
          name="file_number"
          value={formData.file_number}
          onChange={(e) => onChange('file_number', e.target.value)}
          placeholder="مثال: T-012"
        />
      </div>
    </div>
  );
}
