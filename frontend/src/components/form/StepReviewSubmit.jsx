import React, { useState } from 'react';
import { CheckCircle, AlertCircle, User, FileText, Phone, MapPin, Award, BookOpen, ShieldCheck } from 'lucide-react';

export default function StepReviewSubmit({ formData, isTeacher = false, onSubmit, submitting = false, submitError = '' }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="form-step">
      <div className="section-header">
        <div className="section-title">
          <ShieldCheck size={22} color="var(--primary)" />
          <span>المراجعة الشاملة وتأكيد البيانات قبل الحفظ</span>
        </div>
        <span className="section-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
          الخطوة الأخيرة
        </span>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        {/* Top Header Card */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '80px', height: '95px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formData.photo_url ? (
              <img src={formData.photo_url} alt="الصورة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={40} color="#94a3b8" />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>الاسم الرباعي الكامل:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formData.quad_name || 'لم يُحدد'}
            </div>
            <div style={{ fontSize: '0.92rem', color: '#334155', marginTop: '2px' }}>
              {isTeacher
                ? `${formData.job_title || 'مدرس'} - ${formData.staff_category || 'تدريسي'}`
                : `${formData.grade || 'الأول متوسط'} - الشعبة (${formData.section || 'أ'})`}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid-2" style={{ gap: '1.25rem' }}>
          {/* Card 1: Personal */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> المعلومات الشخصية
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>اللقب:</strong> {formData.surname || '-'}</div>
              <div><strong>اسم الأم:</strong> {formData.mother_name || '-'}</div>
              <div><strong>تاريخ التولد:</strong> {formData.dob || '-'}</div>
              <div><strong>الجنس:</strong> {formData.gender || '-'}</div>
              <div><strong>المحافظة:</strong> {formData.province || '-'}</div>
              <div><strong>فئة الدم:</strong> {formData.blood_type || '-'}</div>
            </div>
          </div>

          {/* Card 2: Documents */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> الوثائق الرسمية
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>نوع الوثيقة:</strong> {formData.id_type || '-'}</div>
              <div><strong>الرقم الوطني / الموحدة:</strong> {formData.national_id || formData.id_number || '-'}</div>
              <div><strong>رقم السجل:</strong> {formData.record_number || '-'}</div>
              <div><strong>رقم الصحيفة:</strong> {formData.page_number || '-'}</div>
              <div><strong>جهة الإصدار:</strong> {formData.id_issuer || '-'}</div>
            </div>
          </div>

          {/* Card 3: Contact & Address */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} /> السكن والاتصال
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>رقم الهاتف:</strong> {formData.phone || '-'}</div>
              <div><strong>هاتف إضافي:</strong> {formData.alt_phone || '-'}</div>
              <div><strong>المنطقة / الحي:</strong> {formData.neighborhood || '-'}</div>
              <div><strong>أقرب نقطة دالة:</strong> {formData.landmark || '-'}</div>
              <div><strong>العنوان بالتفصيل:</strong> {formData.address_details || '-'}</div>
            </div>
          </div>

          {/* Card 4: Academic or Job info */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isTeacher ? <Award size={16} /> : <BookOpen size={16} />}
              {isTeacher ? 'المعلومات الوظيفية' : 'المعلومات الدراسية وولي الأمر'}
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isTeacher ? (
                <>
                  <div><strong>نوع التوظيف:</strong> {formData.employment_type || '-'}</div>
                  <div><strong>نوع الموظف:</strong> {formData.staff_category || '-'}</div>
                  <div><strong>المسمى الوظيفي:</strong> {formData.job_title || '-'}</div>
                  <div><strong>المادة التدريسية:</strong> {formData.subject_taught || '-'}</div>
                  <div><strong>أعلى تحصيل:</strong> {formData.highest_degree || '-'}</div>
                  <div><strong>الكلية / المعهد:</strong> {formData.university || '-'}</div>
                </>
              ) : (
                <>
                  <div><strong>الصف والشعبة:</strong> {formData.grade} - {formData.section}</div>
                  <div><strong>المعدل:</strong> {formData.gpa || '-'}</div>
                  <div><strong>حالة الطالبة:</strong> {formData.student_status}</div>
                  <div><strong>اسم ولي الأمر الرباعي:</strong> {formData.guardian_quad_name || '-'}</div>
                  <div><strong>صلة القرابة:</strong> {formData.guardian_relationship || '-'}</div>
                  <div><strong>هاتف ولي الأمر:</strong> {formData.guardian_phone || '-'}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation agreement */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#92400e' }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
          />
          <span>
            أقر بأن جميع البيانات والمعلومات الواردة أعلاه صحيحة ودقيقة، وأتحمل المسؤولية القانونية والإدارية عن صحتها أمام إدارة المدرسة ووزارة التربية.
          </span>
        </label>
      </div>

      {submitError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-lg btn-primary"
          onClick={onSubmit}
          disabled={!confirmed || submitting}
          style={{ minWidth: '280px' }}
        >
          {submitting ? 'جاري إرسال واعتماد الاستمارة...' : (
            <>
              <CheckCircle size={20} />
              <span>إرسال واعتماد الاستمارة الرسمية</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
