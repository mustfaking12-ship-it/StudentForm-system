import React from 'react';
import '../../styles/print.css';

export default function StudentPrintA4({ student, onBack }) {
  if (!student) return null;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>معاينة الطباعة الرسمية A4 - استمارة معلومات الطالبة</h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            الاستمارة المدرسية الرسمية لـ مدرسة المتفوقات الأولى للبنات
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
                <span>استمارة معلومات وقيد الطالبة الإلكترونية EMIS</span>
                <span className="code-badge">{student.code}</span>
              </div>
            </div>

            {/* Photo & Quad Name Section */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div className="print-section-title">
                  <span>أولاً: معلومات الطالبة والنسب</span>
                </div>
                <table className="print-table">
                  <tbody>
                    <tr className="print-quad-name-row">
                      <td className="label-cell">الاسم الرباعي *:</td>
                      <td colSpan={3} className="value-cell print-quad-name-val">
                        {student.quad_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">اللقب:</td>
                      <td className="value-cell">{student.surname || '-'}</td>
                      <td className="label-cell">اسم الأم:</td>
                      <td className="value-cell">{student.mother_name || '-'}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">تاريخ التولد *:</td>
                      <td className="value-cell">{student.dob}</td>
                      <td className="label-cell">مسقط الرأس:</td>
                      <td className="value-cell">{student.birth_place || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photo Box */}
              <div className="print-photo-box">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="صورة الطالبة" />
                ) : (
                  <>
                    <span>الصورة</span>
                    <span>الشخصية</span>
                    <span>للطالبة</span>
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
                  <td className="value-cell">{student.id_type || 'بطاقة موحدة'}</td>
                  <td className="label-cell">الرقم الوطني / الموحدة *:</td>
                  <td className="value-cell">{student.national_id || student.id_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">رقم السجل:</td>
                  <td className="value-cell">{student.record_number || '-'}</td>
                  <td className="label-cell">رقم الصحيفة:</td>
                  <td className="value-cell">{student.page_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الرقم العائلي:</td>
                  <td className="value-cell">{student.family_number || '-'}</td>
                  <td className="label-cell">الجنسية:</td>
                  <td className="value-cell">{student.nationality || 'عراقية'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الديانة:</td>
                  <td className="value-cell">{student.religion || 'مسلم'}</td>
                  <td className="label-cell">فئة الدم:</td>
                  <td className="value-cell">{student.blood_type || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">جهة الإصدار:</td>
                  <td className="value-cell">{student.id_issuer || '-'}</td>
                  <td className="label-cell">تاريخ الإصدار:</td>
                  <td className="value-cell">{student.id_issue_date || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 3: Academic Info */}
            <div className="print-section-title">
              <span>ثالثاً: المعلومات الدراسية والقيد المدرسي</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="label-cell">الصف الدراسي *:</td>
                  <td className="value-cell" style={{ fontWeight: 700 }}>{student.grade}</td>
                  <td className="label-cell">الشعبة *:</td>
                  <td className="value-cell" style={{ fontWeight: 700 }}>{student.section}</td>
                </tr>
                <tr>
                  <td className="label-cell">المرحلة الدراسية:</td>
                  <td className="value-cell">{student.study_stage || 'المتوسطة'}</td>
                  <td className="label-cell">نوع الدراسة:</td>
                  <td className="value-cell">{student.study_type || 'صباحي'}</td>
                </tr>
                <tr>
                  <td className="label-cell">المعدل الدراسي:</td>
                  <td className="value-cell">{student.gpa ? `${student.gpa}%` : '-'}</td>
                  <td className="label-cell">حالة الطالبة *:</td>
                  <td className="value-cell">{student.student_status}</td>
                </tr>
                <tr>
                  <td className="label-cell">الرقم المدرسي:</td>
                  <td className="value-cell">{student.student_school_id || '-'}</td>
                  <td className="label-cell">رقم الإضبارة:</td>
                  <td className="value-cell">{student.file_number || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">المدرسة السابقة:</td>
                  <td colSpan={3} className="value-cell">{student.previous_school || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 4: Guardian */}
            <div className="print-section-title">
              <span>رابعاً: معلومات ولي الأمر والمسؤول القانوني</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr className="print-quad-name-row">
                  <td className="label-cell">اسم ولي الأمر الرباعي *:</td>
                  <td colSpan={3} className="value-cell print-quad-name-val">
                    {student.guardian_quad_name}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">صلة القرابة *:</td>
                  <td className="value-cell">{student.guardian_relationship}</td>
                  <td className="label-cell">هاتف ولي الأمر *:</td>
                  <td className="value-cell">{student.guardian_phone}</td>
                </tr>
                <tr>
                  <td className="label-cell">المهنة:</td>
                  <td className="value-cell">{student.guardian_job || '-'}</td>
                  <td className="label-cell">مكان العمل:</td>
                  <td className="value-cell">{student.guardian_workplace || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 5: Contact, Address, Special Needs */}
            <div className="print-section-title">
              <span>خامساً: السكن والاتصال والاحتياجات الخاصة</span>
            </div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="label-cell">هاتف الطالبة / السكن *:</td>
                  <td className="value-cell">{student.phone}</td>
                  <td className="label-cell">نوع السكن:</td>
                  <td className="value-cell">{student.housing_type || 'ملك'}</td>
                </tr>
                <tr>
                  <td className="label-cell">المحافظة / المنطقة:</td>
                  <td className="value-cell">{student.province} - {student.neighborhood || student.district || '-'}</td>
                  <td className="label-cell">أقرب نقطة دالة:</td>
                  <td className="value-cell">{student.landmark || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">العنوان بالتفصيل:</td>
                  <td colSpan={3} className="value-cell">{student.address_details || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">الاحتياجات الخاصة:</td>
                  <td colSpan={3} className="value-cell">
                    {student.has_special_needs ? `يوجد: ${student.special_needs_details || student.special_needs_type || ''}` : 'لا يوجد'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Signatures Box */}
            <div className="print-signatures-row">
              <div className="print-signature-col">
                <div>تم التسجيل في: [ {new Date(student.created_at || Date.now()).toLocaleDateString('ar-IQ')} ]</div>
              </div>

              <div className="print-signature-col">
                <div>اسم المنظم:</div>
                <div className="print-signature-line">التوقيع</div>
              </div>

              <div className="print-signature-col">
                <div>توقيع ولي أمر الطالبة:</div>
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
