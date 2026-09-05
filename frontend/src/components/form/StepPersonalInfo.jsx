import React from 'react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import QuadNameInput from '../common/QuadNameInput';


const IRAQ_PROVINCES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف الأشرف', 'كربلاء المقدسة',
  'بابل', 'ذي قار', 'ميسان', 'ديالى', 'الأنبار', 'كركوك',
  'صلاح الدين', 'واسط', 'القادسية (الديوانية)', 'المثنى', 'دهوك', 'السليمانية'
];

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function StepPersonalInfo({ formData, onChange, errors = {}, isTeacher = false }) {
  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <span>القسم الأول: المعلومات الشخصية والنسب</span>
        </div>
        <span className="section-badge">مطلوب للتحقق</span>
      </div>

      {/* Official Photo Notice (No digital upload required) */}
      <div style={{
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.88rem',
        color: '#475569'
      }}>
        <span style={{ fontSize: '1.25rem' }}>📷</span>
        <span>
          <strong>الصورة الشخصية:</strong> لا يتطلب النظام رفع صورة إلكترونياً؛ تُرفق وتُثبت الصورة الورقية الملونة ذات الخلفية البيضاء على الاستمارة بعد الطباعة الرسمية.
        </span>
      </div>

      <div className="grid-2">
        {/* IMPORTANT: Single Quad Name Field */}
        <div style={{ gridColumn: 'span 2' }}>
          <QuadNameInput
            label={isTeacher ? 'الاسم الرباعي للموظف / المدرس' : 'الاسم الرباعي الكامل للطالبة'}
            name="quad_name"
            value={formData.quad_name}
            onChange={(e) => onChange('quad_name', e.target.value)}
            required={true}
            error={errors.quad_name}
            placeholder="اكتب الاسم الرباعي كاملاً (مثال: مصطفى حسن جاسم محمد)"
          />
        </div>

        <InputField
          label="اللقب / العشيرة"
          name="surname"
          value={formData.surname}
          onChange={(e) => onChange('surname', e.target.value)}
          placeholder="مثال: الساعدي، التميمي..."
        />

        <InputField
          label="اسم الأم الثلاثي"
          name="mother_name"
          value={formData.mother_name}
          onChange={(e) => onChange('mother_name', e.target.value)}
          placeholder="مثال: هدى رحيم جبار"
        />

        <InputField
          label="تاريخ التولد (الميلاد)"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => onChange('dob', e.target.value)}
          required={true}
          error={errors.dob}
        />

        <SelectField
          label="الجنس"
          name="gender"
          value={formData.gender || (isTeacher ? 'أنثى' : 'أنثى')}
          onChange={(e) => onChange('gender', e.target.value)}
          options={[
            { value: 'أنثى', label: 'أنثى' },
            { value: 'ذكر', label: 'ذكر' }
          ]}
          required={true}
        />

        <SelectField
          label="الجنسية"
          name="nationality"
          value={formData.nationality || 'عراقية'}
          onChange={(e) => onChange('nationality', e.target.value)}
          options={[
            { value: 'عراقية', label: 'عراقية' },
            { value: 'عراقي', label: 'عراقي' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
          required={true}
        />

        <SelectField
          label="الديانة"
          name="religion"
          value={formData.religion || 'مسلم'}
          onChange={(e) => onChange('religion', e.target.value)}
          options={[
            { value: 'مسلم', label: 'مسلم' },
            { value: 'مسيحي', label: 'مسيحي' },
            { value: 'صابئي مندائي', label: 'صابئي مندائي' },
            { value: 'إيزيدي', label: 'إيزيدي' },
            { value: 'أخرى', label: 'أخرى' }
          ]}
        />

        <InputField
          label="مكان الولادة / مسقط الرأس"
          name="birth_place"
          value={formData.birth_place}
          onChange={(e) => onChange('birth_place', e.target.value)}
          placeholder="مثال: بغداد - الكرخ"
        />

        <SelectField
          label="فئة الدم"
          name="blood_type"
          value={formData.blood_type}
          onChange={(e) => onChange('blood_type', e.target.value)}
          options={BLOOD_TYPES}
          placeholder="اختر فئة الدم..."
        />

        <SelectField
          label="المحافظة"
          name="province"
          value={formData.province || 'بغداد'}
          onChange={(e) => onChange('province', e.target.value)}
          options={IRAQ_PROVINCES}
        />

        <InputField
          label="القضاء"
          name="district"
          value={formData.district}
          onChange={(e) => onChange('district', e.target.value)}
          placeholder="مثال: الكرخ، الرصافة، المنصور..."
        />

        <InputField
          label="الناحية"
          name="sub_district"
          value={formData.sub_district}
          onChange={(e) => onChange('sub_district', e.target.value)}
          placeholder="مثال: الداوودي، اليرموك..."
        />

        {isTeacher && (
          <SelectField
            label="الحالة الاجتماعية"
            name="social_status"
            value={formData.social_status || 'متزوج/ة'}
            onChange={(e) => onChange('social_status', e.target.value)}
            options={[
              { value: 'أعزب/ة', label: 'أعزب / عزباء' },
              { value: 'متزوج/ة', label: 'متزوج / متزوجة' },
              { value: 'أرمل/ة', label: 'أرمل / أرملة' },
              { value: 'مطلق/ة', label: 'مطلق / مطلقة' }
            ]}
          />
        )}
      </div>
    </div>
  );
}
