import React, { useState, useEffect } from 'react';
import { ArrowRight, Printer, Edit2, User, Phone, MapPin, FileText, Award, BookOpen, RefreshCw } from 'lucide-react';
import StudentPrintA4 from '../components/print/StudentPrintA4';
import TeacherPrintA4 from '../components/print/TeacherPrintA4';
import { studentService, teacherService } from '../services/api';

export default function RecordDetailsPage({ recordId, recordType = 'student', onBack, onEdit }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const service = recordType === 'student' ? studentService : teacherService;
        const res = await service.getById(recordId);
        if (res.success && res.data) {
          setRecord(res.data);
        } else {
          setError('السجل غير موجود أو تعذر تحميله');
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب تفاصيل السجل');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [recordId, recordType]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>جاري تحميل تفاصيل السجل...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 700 }}>{error || 'لم يتم العثور على السجل'}</p>
        <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          الرجوع
        </button>
      </div>
    );
  }

  // If in print mode, render the official Ministry EMIS A4 component
  if (printMode) {
    return recordType === 'student' ? (
      <StudentPrintA4 student={record} onBack={() => setPrintMode(false)} />
    ) : (
      <TeacherPrintA4 teacher={record} onBack={() => setPrintMode(false)} />
    );
  }

  const isStu = recordType === 'student';

  return (
    <div className="record-details-page">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowRight size={16} />
            رجوع
          </button>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
              ملف السجل: {record.quad_name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span className={`badge ${isStu ? 'badge-primary' : 'badge-warning'}`}>{record.code}</span>
              <span className="badge badge-info">{isStu ? 'طالبة' : (record.staff_category || 'موظف')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => setPrintMode(true)}
          >
            <Printer size={16} />
            طباعة الاستمارة الرسمية A4
          </button>

          {onEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onEdit(record, recordType)}
            >
              <Edit2 size={16} />
              تعديل البيانات
            </button>
          )}
        </div>
      </div>

      {/* Main Details Layout */}
      <div className="form-card" style={{ padding: '2rem' }}>
        {/* Profile Card Header */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '110px', height: '130px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {record.photo_url ? (
              <img src={record.photo_url} alt={record.quad_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={54} color="#94a3b8" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>الاسم الرباعي الكامل:</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              {record.quad_name}
            </div>
            <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 600 }}>
              {isStu
                ? `${record.grade} - الشعبة (${record.section}) | معدل: ${record.gpa ? `${record.gpa}%` : 'غير مدخل'}`
                : `${record.job_title || 'مدرس'} - ${record.staff_category || 'تدريسي'} | ${record.employment_type || 'ملاك دائم'}`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
              تاريخ التسجيل: {new Date(record.created_at).toLocaleDateString('ar-IQ')} | آخر تحديث: {new Date(record.updated_at).toLocaleDateString('ar-IQ')}
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Section 1: Personal Demographics */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} /> 1. المعلومات الشخصية
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.92rem' }}>
              <div><strong>اللقب:</strong> {record.surname || '-'}</div>
              <div><strong>اسم الأم:</strong> {record.mother_name || '-'}</div>
              <div><strong>تاريخ التولد:</strong> {record.dob}</div>
              <div><strong>الجنس:</strong> {record.gender}</div>
              <div><strong>الجنسية:</strong> {record.nationality}</div>
              <div><strong>الديانة:</strong> {record.religion}</div>
              <div><strong>فئة الدم:</strong> {record.blood_type || '-'}</div>
              <div><strong>مسقط الرأس:</strong> {record.birth_place || '-'}</div>
              <div><strong>المحافظة:</strong> {record.province}</div>
              {!isStu && <div><strong>الحالة الاجتماعية:</strong> {record.social_status || '-'}</div>}
            </div>
          </div>

          {/* Section 2: Identification */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} /> 2. وثائق الهوية والأحوال
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.92rem' }}>
              <div><strong>نوع الوثيقة:</strong> {record.id_type}</div>
              <div><strong>الرقم الوطني / الموحدة:</strong> {record.national_id || record.id_number || '-'}</div>
              <div><strong>رقم السجل:</strong> {record.record_number || '-'}</div>
              <div><strong>رقم الصحيفة:</strong> {record.page_number || '-'}</div>
              <div><strong>الرقم العائلي:</strong> {record.family_number || '-'}</div>
              <div><strong>جهة الإصدار:</strong> {record.id_issuer || '-'}</div>
              <div><strong>تاريخ الإصدار:</strong> {record.id_issue_date || '-'}</div>
              {!isStu && <div><strong>الرقم الوظيفي:</strong> {record.job_number || '-'}</div>}
            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={18} /> 3. الاتصال والعنوان
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.92rem' }}>
              <div><strong>الهاتف الأساسي:</strong> {record.phone}</div>
              <div><strong>هاتف إضافي:</strong> {record.alt_phone || '-'}</div>
              <div><strong>البريد:</strong> {record.email || '-'}</div>
              <div><strong>نوع السكن:</strong> {record.housing_type || 'ملك'}</div>
              <div><strong>المنطقة / الحي:</strong> {record.neighborhood || '-'}</div>
              <div><strong>أقرب نقطة دالة:</strong> {record.landmark || '-'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>العنوان بالتفصيل:</strong> {record.address_details || '-'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>جهة الطوارئ:</strong> {record.emergency_contact_name ? `${record.emergency_contact_name} (${record.emergency_relationship}) - ${record.emergency_phone}` : '-'}
              </div>
            </div>
          </div>

          {/* Section 4: Academic / Job / Guardian */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isStu ? <BookOpen size={18} /> : <Award size={18} />}
              {isStu ? '4. القيد الدراسي وولي الأمر' : '4. الوظيفة والمؤهلات'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.92rem' }}>
              {isStu ? (
                <>
                  <div><strong>الصف والشعبة:</strong> {record.grade} ({record.section})</div>
                  <div><strong>حالة الطالبة:</strong> {record.student_status}</div>
                  <div><strong>المعدل:</strong> {record.gpa ? `${record.gpa}%` : '-'}</div>
                  <div><strong>المدرسة السابقة:</strong> {record.previous_school || '-'}</div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '4px' }}>
                    <strong>اسم ولي الأمر الرباعي:</strong> {record.guardian_quad_name} ({record.guardian_relationship})
                  </div>
                  <div><strong>هاتف ولي الأمر:</strong> {record.guardian_phone}</div>
                  <div><strong>مهنة ولي الأمر:</strong> {record.guardian_job || '-'}</div>
                </>
              ) : (
                <>
                  <div><strong>نوع التوظيف:</strong> {record.employment_type}</div>
                  <div><strong>نوع الموظف:</strong> {record.staff_category}</div>
                  <div><strong>المسمى الوظيفي:</strong> {record.job_title}</div>
                  <div><strong>المنصب الحالي:</strong> {record.job_position}</div>
                  <div><strong>المادة / الاختصاص:</strong> {record.subject_taught || '-'}</div>
                  <div><strong>أعلى تحصيل:</strong> {record.highest_degree}</div>
                  <div><strong>الجامعة:</strong> {record.university || '-'}</div>
                  <div><strong>سنة التخرج:</strong> {record.grad_year || '-'}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Special Needs Alert Banner if present */}
        {record.has_special_needs === 1 && (
          <div style={{ marginTop: '1.5rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', color: '#92400e' }}>
            <strong>ملاحظة رعاية خاصة:</strong> {record.special_needs_details || record.special_needs_type || 'توجد احتياجات خاصة مسجلة'}
          </div>
        )}
      </div>
    </div>
  );
}
