import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Save, Check } from 'lucide-react';
import WizardStepper from '../components/form/WizardStepper';
import StepPersonalInfo from '../components/form/StepPersonalInfo';
import StepIdDocs from '../components/form/StepIdDocs';
import StepContactAddress from '../components/form/StepContactAddress';
import StepSpecialNeeds from '../components/form/StepSpecialNeeds';
import StepJobInfoTeacher from '../components/form/StepJobInfoTeacher';
import StepAcademicTeacher from '../components/form/StepAcademicTeacher';
import StepReviewSubmit from '../components/form/StepReviewSubmit';
import DuplicateWarningModal from '../components/common/DuplicateWarningModal';
import { useAutoSave } from '../hooks/useAutoSave';
import { teacherService } from '../services/api';

const STEPS = [
  { id: 'personal', title: 'المعلومات الشخصية' },
  { id: 'docs', title: 'الهوية والوثائق' },
  { id: 'contact', title: 'السكن والاتصال' },
  { id: 'needs', title: 'الاحتياجات الخاصة' },
  { id: 'job', title: 'المعلومات الوظيفية' },
  { id: 'education', title: 'التحصيل الدراسي' },
  { id: 'review', title: 'المراجعة والحفظ' }
];

const INITIAL_DATA = {
  quad_name: '',
  surname: '',
  mother_name: '',
  dob: '',
  gender: 'أنثى',
  nationality: 'عراقي',
  religion: 'مسلم',
  mother_tongue: 'العربية',
  birth_country: 'العراق',
  birth_place: '',
  province: 'بغداد',
  district: '',
  sub_district: '',
  blood_type: '',
  social_status: 'متزوج/ة',
  id_type: 'بطاقة وطنية موحدة',
  id_number: '',
  national_id: '',
  record_number: '',
  page_number: '',
  family_number: '',
  id_issuer: '',
  issuer_country: 'العراق',
  id_issue_date: '',
  phone: '',
  alt_phone: '',
  email: '',
  city_village: '',
  neighborhood: '',
  mahalla: '',
  zuqaq: '',
  house_no: '',
  address_details: '',
  landmark: '',
  housing_type: 'ملك',
  emergency_contact_name: '',
  emergency_relationship: '',
  emergency_phone: '',
  has_special_needs: 0,
  special_needs_type: '',
  special_needs_level: '',
  special_needs_details: '',
  special_needs_notes: '',
  employment_type: 'ملاك دائم',
  staff_category: 'تدريسي',
  employment_status: 'مستمر',
  job_title: '',
  job_grade: '',
  classification: 'مدرس',
  job_official_title: '',
  job_position: 'مدرس',
  school_name: 'مدرسة المتفوقات الأولى للبنات',
  department: '',
  subject_taught: '',
  stages_taught: '',
  first_appointment_date: '',
  start_date: '',
  job_number: '',
  file_number: '',
  highest_degree: 'بكالوريوس',
  university: '',
  college_dept: '',
  specialization: '',
  grad_year: '',
  degree_name: '',
  training_courses: '',
  notes: '',
  photo_url: ''
};

export default function TeacherFormPage({ onCancel, onSuccess, onViewExistingRecord }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-save hook
  const { hasDraft, loadDraft, clearDraft } = useAutoSave('draft_teacher_form', formData, isSubmitted);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
      clearDraft();
    }
  };

  const validateCurrentStep = () => {
    const stepErrors = {};

    if (currentStep === 0) {
      const words = (formData.quad_name || '').trim().split(/\s+/).filter(w => w.length > 0);
      if (!formData.quad_name || words.length < 4) {
        stepErrors.quad_name = `يرجى إدخال الاسم الرباعي كاملاً (4 كلمات على الأقل، المدخل حالياً: ${words.length} كلمات)`;
      }
      if (!formData.dob) {
        stepErrors.dob = 'يرجى إدخال تاريخ التولد';
      }
    } else if (currentStep === 2) {
      if (!formData.phone || formData.phone.trim().length < 10) {
        stepErrors.phone = 'يرجى إدخال رقم هاتف فعال (10 أرقام على الأقل)';
      }
    } else if (currentStep === 4) {
      if (!formData.employment_type) {
        stepErrors.employment_type = 'يرجى تحديد نوع التوظيف';
      }
      if (!formData.staff_category) {
        stepErrors.staff_category = 'يرجى تحديد نوع الموظف';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 0) {
      try {
        const dupCheck = await teacherService.checkDuplicate({
          quad_name: formData.quad_name,
          dob: formData.dob,
          national_id: formData.national_id,
          phone: formData.phone
        });

        if (dupCheck.isDuplicate) {
          setDuplicateWarning(dupCheck);
          return;
        }
      } catch (e) {
        console.error('Duplicate check error:', e);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await teacherService.create(formData);
      if (res.success && res.data) {
        setIsSubmitted(true);
        clearDraft();
        onSuccess(res.data);
      } else {
        setSubmitError(res.message || 'حدث خطأ أثناء حفظ استمارة الموظف');
      }
    } catch (err) {
      setSubmitError(err.message || 'فشل حفظ الاستمارة، يرجى مراجعة البيانات والمحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      {hasDraft && currentStep === 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #facc15', color: '#854d0e', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} />
            <span>توجد مسودة غير مكتملة محفوظة تلقائياً من زيارتك السابقة.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-sm btn-gold" onClick={handleRestoreDraft}>
              استرجاع المسودة
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={clearDraft}>
              تجاهل ومسح
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>
            استمارة معلومات الموظفين والمعلمين (نظام EMIS الوزاري)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            مدرسة المتفوقات الأولى للبنات - وزارة التربية العراقية
          </p>
        </div>

        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          <RotateCcw size={16} />
          العودة للرئيسية
        </button>
      </div>

      <WizardStepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      <div className="form-card">
        {currentStep === 0 && (
          <StepPersonalInfo
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            isTeacher={true}
          />
        )}

        {currentStep === 1 && (
          <StepIdDocs
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <StepContactAddress
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            isTeacher={true}
          />
        )}

        {currentStep === 3 && (
          <StepSpecialNeeds
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 4 && (
          <StepJobInfoTeacher
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <StepAcademicTeacher
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 6 && (
          <StepReviewSubmit
            formData={formData}
            isTeacher={true}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {currentStep < 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ArrowRight size={18} />
              الخطوة السابقة
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              الخطوة التالية
              <ArrowLeft size={18} />
            </button>
          </div>
        )}
      </div>

      {duplicateWarning && (
        <DuplicateWarningModal
          isOpen={true}
          onClose={() => setDuplicateWarning(null)}
          onProceed={() => {
            setDuplicateWarning(null);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
          }}
          onViewExisting={onViewExistingRecord}
          matchedRecord={duplicateWarning.matchedRecord}
          message={duplicateWarning.message}
        />
      )}
    </div>
  );
}
