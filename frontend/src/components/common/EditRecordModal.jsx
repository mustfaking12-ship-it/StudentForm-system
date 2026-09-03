import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import InputField from './InputField';
import SelectField from './SelectField';
import QuadNameInput from './QuadNameInput';
import { studentService, teacherService } from '../../services/api';

export default function EditRecordModal({ isOpen, onClose, record, type = 'student', onSaveSuccess }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      setError('');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const service = type === 'student' ? studentService : teacherService;
      const res = await service.update(record.id, formData);
      if (res.success) {
        onSaveSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const isStu = type === 'student';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`تعديل بيانات السجل: ${record.code}`} size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid-2">
          <div style={{ gridColumn: 'span 2' }}>
            <QuadNameInput
              label="الاسم الرباعي الكامل *"
              name="quad_name"
              value={formData.quad_name || ''}
              onChange={(e) => handleChange('quad_name', e.target.value)}
              required={true}
            />
          </div>

          <InputField
            label="اللقب"
            name="surname"
            value={formData.surname || ''}
            onChange={(e) => handleChange('surname', e.target.value)}
          />

          <InputField
            label="اسم الأم"
            name="mother_name"
            value={formData.mother_name || ''}
            onChange={(e) => handleChange('mother_name', e.target.value)}
          />

          <InputField
            label="تاريخ التولد *"
            name="dob"
            type="date"
            value={formData.dob || ''}
            onChange={(e) => handleChange('dob', e.target.value)}
            required={true}
          />

          <InputField
            label="رقم الهاتف *"
            name="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            required={true}
          />

          <InputField
            label="رقم البطاقة الوطنية / الهوية"
            name="national_id"
            value={formData.national_id || ''}
            onChange={(e) => handleChange('national_id', e.target.value)}
          />

          <InputField
            label="المحافظة"
            name="province"
            value={formData.province || 'بغداد'}
            onChange={(e) => handleChange('province', e.target.value)}
          />

          <InputField
            label="العنوان بالتفصيل"
            name="address_details"
            value={formData.address_details || ''}
            onChange={(e) => handleChange('address_details', e.target.value)}
          />

          {isStu ? (
            <>
              <InputField
                label="الصف الدراسي *"
                name="grade"
                value={formData.grade || ''}
                onChange={(e) => handleChange('grade', e.target.value)}
                required={true}
              />

              <InputField
                label="الشعبة *"
                name="section"
                value={formData.section || ''}
                onChange={(e) => handleChange('section', e.target.value)}
                required={true}
              />

              <InputField
                label="المعدل"
                name="gpa"
                type="number"
                step="0.01"
                value={formData.gpa || ''}
                onChange={(e) => handleChange('gpa', e.target.value)}
              />

              <SelectField
                label="حالة الطالبة"
                name="student_status"
                value={formData.student_status || 'مستمرة'}
                onChange={(e) => handleChange('student_status', e.target.value)}
                options={['مستمرة', 'منقولة', 'متخرجة', 'مفصولة', 'متوقفة']}
              />

              <div style={{ gridColumn: 'span 2' }}>
                <QuadNameInput
                  label="الاسم الرباعي لولي الأمر *"
                  name="guardian_quad_name"
                  value={formData.guardian_quad_name || ''}
                  onChange={(e) => handleChange('guardian_quad_name', e.target.value)}
                  required={true}
                />
              </div>

              <InputField
                label="هاتف ولي الأمر *"
                name="guardian_phone"
                value={formData.guardian_phone || ''}
                onChange={(e) => handleChange('guardian_phone', e.target.value)}
                required={true}
              />

              <InputField
                label="صلة القرابة"
                name="guardian_relationship"
                value={formData.guardian_relationship || 'الأب'}
                onChange={(e) => handleChange('guardian_relationship', e.target.value)}
              />
            </>
          ) : (
            <>
              <InputField
                label="المسمى الوظيفي"
                name="job_title"
                value={formData.job_title || ''}
                onChange={(e) => handleChange('job_title', e.target.value)}
              />

              <InputField
                label="المادة / الاختصاص"
                name="subject_taught"
                value={formData.subject_taught || ''}
                onChange={(e) => handleChange('subject_taught', e.target.value)}
              />

              <SelectField
                label="نوع التوظيف"
                name="employment_type"
                value={formData.employment_type || 'ملاك دائم'}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                options={['ملاك دائم', 'عقد', 'محاضر', 'أجير']}
              />

              <SelectField
                label="الحالة الوظيفية"
                name="employment_status"
                value={formData.employment_status || 'مستمر'}
                onChange={(e) => handleChange('employment_status', e.target.value)}
                options={['مستمر', 'متقاعد', 'مفصول', 'متوفي']}
              />

              <InputField
                label="أعلى تحصيل دراسي"
                name="highest_degree"
                value={formData.highest_degree || 'بكالوريوس'}
                onChange={(e) => handleChange('highest_degree', e.target.value)}
              />

              <InputField
                label="الجامعة / الكلية"
                name="university"
                value={formData.university || ''}
                onChange={(e) => handleChange('university', e.target.value)}
              />
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={16} />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
