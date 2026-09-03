import React from 'react';
import '../../styles/print.css';

export default function TeacherPrintA4({ teacher, onBack }) {
  if (!teacher) return null;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>معاينة الطباعة الرسمية A4 - استمارة الموظفين والمعلمين</h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            مطابقة للنموذج المعتمد في وزارة التربية العراقية لنظام EMIS
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onBack && (
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              رجوع
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            طباعة الاستمارة الرسمية A4
          </button>
        </div>
      </div>

      <div className="print-document-container">
        <div className="print-border-frame">
          <div className="print-inner-frame">
            {/* Header */}
            <div className="print-header">
              <div className="print-ministry-title">جمهورية العراق – وزارة التربية</div>
              <div className="print-school-subtitle">
                المديرية العامة للتربية | مدرسة المتفوقات الأولى للبنات
              </div>
              <div className="print-banner-box">
                <span>استمارة معلومات الموظفين والمعلمين لنظام EMIS</span>
                <span className="code-badge">{teacher.code}</span>
              </div>
            </div>

            {/* Photo & Quad Name Section */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div className="print-section-title">
                  <span>أولاً: معلومات الاسم والنسب</span>
                </div>
                <table className="print-table">
                  <tbody>
                    <tr className="print-quad-name-row">
                      <td className="label-cell">الاسم الرباعي *:</td>
                      <td colSpan={3} className="value-cell print-quad-name-val">
                        {teacher.quad_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">اللقب:</td>
                      <td className="value-cell">{teacher.surname || '-'}</td>
                      <td className="label-cell">اسم الأم:</td>
                      <td className="value-cell">{teacher.mother_name || '-'}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">تاريخ التولد *:</td>
                      <td className="value-cell">{teacher.dob}</td>
                      <td className="label-cell">مسقط الرأس:</td>
                      <td className="value-cell">{teacher.birth_place || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photo Box */}
              <div className="print-photo-box">
                {teacher.photo_url ? (
                  <img src={teacher.photo_url} alt="صورة الموظف" />
                ) : (
                  <>
                    <span>الصورة</span>
                    <span>الشخصية</span>
                    <span>الرسمية</span>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Documents */}
            <div className="print-section-title">
              <span>ثانياً: وثيقة التعريف والبيانات الشخصية</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="label-cell">نوع الهوية *:</td>
                  <td className="value-cell">{teacher.id_type || 'بطاقة موحدة'}</td>
                  <td className="label-cell">رقم الموحدة/الجنسية *:</td>
                  <td className="value-cell">{teacher.national_id || teacher.id_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">بلد الإصدار:</td>
                  <td className="value-cell">{teacher.issuer_country || 'العراق'}</td>
                  <td className="label-cell">الرقم الوظيفي:</td>
                  <td className="value-cell">{teacher.job_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">السجل:</td>
                  <td className="value-cell">{teacher.record_number || '-'}</td>
                  <td className="label-cell">الصحيفة:</td>
                  <td className="value-cell">{teacher.page_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الرقم العائلي:</td>
                  <td className="value-cell">{teacher.family_number || '-'}</td>
                  <td className="label-cell">الجنس *:</td>
                  <td className="value-cell">{teacher.gender || 'أنثى'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الجنسية *:</td>
                  <td className="value-cell">{teacher.nationality || 'عراقي'}</td>
                  <td className="label-cell">فئة الدم:</td>
                  <td className="value-cell">{teacher.blood_type || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الحالة الاجتماعية:</td>
                  <td className="value-cell">{teacher.social_status || 'متزوج/ة'}</td>
                  <td className="label-cell">الديانة *:</td>
                  <td className="value-cell">{teacher.religion || 'مسلم'}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 3: Job and Qualifications */}
            <div className="print-section-title">
              <span>ثالثاً: المعلومات الوظيفية والتحصيل الدراسي</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="label-cell">نوع التوظيف *:</td>
                  <td className="value-cell">{teacher.employment_type || 'ملاك دائم'}</td>
                  <td className="label-cell">نوع الموظف *:</td>
                  <td className="value-cell">{teacher.staff_category || 'تدريسي'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الحالة الوظيفية *:</td>
                  <td className="value-cell">{teacher.employment_status || 'مستمر'}</td>
                  <td className="label-cell">المسمى الوظيفي:</td>
                  <td className="value-cell">{teacher.job_title || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">العنوان الوظيفي:</td>
                  <td className="value-cell">{teacher.job_official_title || '-'}</td>
                  <td className="label-cell">المنصب الحالي *:</td>
                  <td className="value-cell">{teacher.job_position || 'مدرس'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الدرجة الوظيفية:</td>
                  <td className="value-cell">{teacher.job_grade || '-'}</td>
                  <td className="label-cell">تاريخ أول تعيين *:</td>
                  <td className="value-cell">{teacher.first_appointment_date || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">المادة التي يدرسها:</td>
                  <td className="value-cell">{teacher.subject_taught || '-'}</td>
                  <td className="label-cell">المراحل التي يدرسها:</td>
                  <td className="value-cell">{teacher.stages_taught || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">التحصيل الدراسي *:</td>
                  <td className="value-cell">{teacher.highest_degree || 'بكالوريوس'}</td>
                  <td className="label-cell">سنة التخرج:</td>
                  <td className="value-cell">{teacher.grad_year || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">اسم الكلية / المعهد *:</td>
                  <td className="value-cell">{teacher.university || '-'}</td>
                  <td className="label-cell">الاختصاص *:</td>
                  <td className="value-cell">{teacher.specialization || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 4: Contact, Address, Special Needs */}
            <div className="print-section-title">
              <span>رابعاً: ذوي الاحتياجات الخاصة والطوارئ والسكن والاتصال</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="label-cell">ذوي الاحتياجات الخاصة:</td>
                  <td className="value-cell">
                    {teacher.has_special_needs ? `يوجد: ${teacher.special_needs_details || teacher.special_needs_type || ''}` : 'لا يوجد'}
                  </td>
                  <td className="label-cell">رقم الهاتف *:</td>
                  <td className="value-cell">{teacher.phone}</td>
                </tr>
                <tr>
                  <td className="label-cell">جهة الاتصال للطوارئ:</td>
                  <td className="value-cell">
                    {teacher.emergency_contact_name ? `${teacher.emergency_contact_name} (${teacher.emergency_relationship || ''})` : '-'}
                  </td>
                  <td className="label-cell">هاتف الطوارئ:</td>
                  <td className="value-cell">{teacher.emergency_phone || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">المحافظة / المدينة:</td>
                  <td className="value-cell">{teacher.province} - {teacher.district || teacher.city_village || '-'}</td>
                  <td className="label-cell">الحي / المحلة:</td>
                  <td className="value-cell">{teacher.neighborhood || '-'} (م: {teacher.mahalla || '-'} ز: {teacher.zuqaq || '-'} د: {teacher.house_no || '-'})</td>
                </tr>
                <tr>
                  <td className="label-cell">أقرب نقطة دالة *:</td>
                  <td className="value-cell">{teacher.landmark || '-'}</td>
                  <td className="label-cell">البريد الإلكتروني:</td>
                  <td className="value-cell">{teacher.email || '-'}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: '8pt', color: '#444444', marginTop: '4px' }}>
              * ملاحظة: الحقول المصحوبة بنجمة (*) إجبارية لإدخال البيانات في نظام EMIS الوزاري.
            </div>

            {/* Bottom Signatures Box */}
            <div className="print-signatures-row">
              <div className="print-signature-col">
                <div>تم تسجيله في: [ {new Date(teacher.created_at || Date.now()).toLocaleDateString('ar-IQ')} ]</div>
              </div>

              <div className="print-signature-col">
                <div>اسم المنظم:</div>
                <div className="print-signature-line">التوقيع</div>
              </div>

              <div className="print-signature-col">
                <div>اسم الموظف / المعلم:</div>
                <div className="print-signature-line">التوقيع</div>
              </div>

              <div className="print-signature-col">
                <div>مصادقة إدارة المدرسة:</div>
                <div className="print-signature-line">الختم الرسمي</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
