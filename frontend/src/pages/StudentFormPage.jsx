import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Save, Check } from 'lucide-react';
import WizardStepper from '../components/form/WizardStepper';
import StepPersonalInfo from '../components/form/StepPersonalInfo';
import StepIdDocs from '../components/form/StepIdDocs';
import StepContactAddress from '../components/form/StepContactAddress';
import StepSpecialNeeds from '../components/form/StepSpecialNeeds';
import StepAcademicStudent from '../components/form/StepAcademicStudent';
import StepGuardian from '../components/form/StepGuardian';
import StepReviewSubmit from '../components/form/StepReviewSubmit';
import DuplicateWarningModal from '../components/common/DuplicateWarningModal';
import { useAutoSave } from '../hooks/useAutoSave';
import { studentService } from '../services/api';

const STEPS = [
  { id: 'personal', title: 'المعلومات الشخصية' },
  { id: 'docs', title: 'الهوية والوثائق' },
  { id: 'contact', title: 'السكن والاتصال' },
  { id: 'needs', title: 'الاحتياجات الخاصة' },
  { id: 'academic', title: 'المعلومات الدراسية' },
  { id: 'guardian', title: 'ولي الأمر' },
  { id: 'review', title: 'المراجعة والحفظ' }
];

const INITIAL_DATA = {
  quad_name: '',
  surname: '',
  mother_name: '',
  dob: '',
  gender: 'أنثى',
  nationality: 'عراقية',
  religion: 'مسلم',
  mother_tongue: 'العربية',
  birth_country: 'العراق',
  birth_place: '',
  province: 'بغداد',
  district: '',
  sub_district: '',
  blood_type: '',
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
  residence_notes: '',
  emergency_contact_name: '',
  emergency_relationship: '',
  emergency_phone: '',
  has_special_needs: 0,
  special_needs_type: '',
  special_needs_level: '',
  special_needs_details: '',
  special_needs_notes: '',
  grade: 'الأول متوسط',
  section: 'أ',
  study_stage: 'المتوسطة',
  study_type: 'صباحي',
  admission_year: new Date().getFullYear().toString(),
  enrollment_year: new Date().getFullYear().toString(),
  previous_school: '',
  gpa: '',
  student_status: 'مستمرة',
  student_school_id: '',
  file_number: '',
  academic_notes: '',
  guardian_quad_name: '',
  guardian_relationship: 'الأب',
  guardian_phone: '',
  guardian_job: '',
  guardian_workplace: '',
  guardian_address: '',
  guardian_email: '',
  photo_url: ''
};

export default function StudentFormPage({ onCancel, onSuccess, onViewExistingRecord }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-save draft hook
  const { hasDraft, loadDraft, clearDraft, lastSaved } = useAutoSave('draft_student_form', formData, isSubmitted);

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

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    const stepErrors = {};

    if (currentStep === 0) {
      // Step 1: Personal Info
      const words = (formData.quad_name || '').trim().split(/\s+/).filter(w => w.length > 0);
      if (!formData.quad_name || words.length < 4) {
        stepErrors.quad_name = `يرجى إدخال الاسم الرباعي كاملاً (4 كلمات على الأقل، المدخل حالياً: ${words.length} كلمات)`;
      }
      if (!formData.dob) {
        stepErrors.dob = 'يرجى إدخال تاريخ التولد';
      }
    } else if (currentStep === 2) {
      // Step 3: Contact
      if (!formData.phone || formData.phone.trim().length < 10) {
        stepErrors.phone = 'يرجى إدخال رقم هاتف فعال (10 أرقام على الأقل)';
      }
    } else if (currentStep === 4) {
      // Step 5: Academic
      if (!formData.grade) {
        stepErrors.grade = 'يرجى اختيار الصف الدراسي';
      }
      if (!formData.section) {
        stepErrors.section = 'يرجى تحديد الشعبة';
      }
    } else if (currentStep === 5) {
      // Step 6: Guardian
      const words = (formData.guardian_quad_name || '').trim().split(/\s+/).filter(w => w.length > 0);
      if (!formData.guardian_quad_name || words.length < 4) {
        stepErrors.guardian_quad_name = `يرجى إدخال الاسم الرباعي لولي الأمر كاملاً (4 كلمات على الأقل)`;
      }
      if (!formData.guardian_phone || formData.guardian_phone.trim().length < 10) {
        stepErrors.guardian_phone = 'يرجى إدخال رقم هاتف ولي الأمر';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Check duplicate if moving from step 0 (personal info)
    if (currentStep === 0) {
      try {
        const dupCheck = await studentService.checkDuplicate({
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
      const res = await studentService.create(formData);
      if (res.success && res.data) {
        setIsSubmitted(true);
        clearDraft();
        onSuccess(res.data);
      } else {
        setSubmitError(res.message || 'حدث خطأ أثناء حفظ الاستمارة');
      }
    } catch (err) {
      setSubmitError(err.message || 'فشل إرسال الاستمارة، يرجى التأكد من صحة البيانات والمحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      {/* Draft Recovery Bar */}
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

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>
            استمارة معلومات وقيد طالبة
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

      {/* Stepper */}
      <WizardStepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Form Card */}
      <div className="form-card">
        {currentStep === 0 && (
          <StepPersonalInfo
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            isTeacher={false}
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
            isTeacher={false}
          />
        )}

        {currentStep === 3 && (
          <StepSpecialNeeds
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {currentStep === 4 && (
          <StepAcademicStudent
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <StepGuardian
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 6 && (
          <StepReviewSubmit
            formData={formData}
            isTeacher={false}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {/* Wizard Navigation Buttons */}
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

      {/* Duplicate Warning Modal */}
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
