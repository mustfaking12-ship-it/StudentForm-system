import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Info,
  Database,
  Archive
} from 'lucide-react';
import { importExportService } from '../services/api';

export default function ImportExportPage() {
  const [targetType, setTargetType] = useState('students');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [backupStatus, setBackupStatus] = useState(null);
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);

  const handleCreateBackup = async () => {
    try {
      await importExportService.createBackup();
      setBackupStatus({ success: true, message: 'تم تحميل ملف النسخة الاحتياطية بنجاح' });
    } catch (err) {
      setBackupStatus({ success: false, message: err.message });
    }
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackupStatus({ loading: true, message: 'جاري استعادة النسخة الاحتياطية...' });
    try {
      const res = await importExportService.restoreBackup(file);
      setBackupStatus({ success: true, message: res.message });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setBackupStatus({ success: false, message: err.message || 'فشل استعادة النسخة الاحتياطية' });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewData(null);
    setCommitResult(null);
    setLoadingPreview(true);

    try {
      const res = await importExportService.preview(file, targetType);
      if (res.success) {
        setPreviewData(res);
      }
    } catch (err) {
      alert(err.message || 'فشل قراءة الملف المرفوع');
      setSelectedFile(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || !previewData.rows) return;

    setCommitting(true);
    setCommitResult(null);

    try {
      const res = await importExportService.commit(previewData.rows, targetType, skipDuplicates);
      if (res.success) {
        setCommitResult(res);
        setPreviewData(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء اعتماد الاستيراد');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="import-export-page">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
          تصدير واستيراد البيانات (Excel / CSV)
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
          تصدير سجلات المدرسة بصيغ رسمية، أو استيراد دفعات جديدة مع المعاينة وكشف المكررات
        </p>
      </div>

      {/* Export Cards Section */}
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="section-title">
          <Download size={20} />
          <span>أولاً: تصدير البيانات المخزنة</span>
        </div>
        <span className="section-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
          دعم كامل للغة العربية UTF-8
        </span>
      </div>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Student Export Card */}
        <div className="form-card" style={{ margin: 0, padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#eef4f9', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                سجلات الطالبات
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                تصدير كافة بيانات الطالبات والقيد المدرسي وأولياء الأمور
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => importExportService.exportExcel('students')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Download size={15} />
              تصدير سجل الطالبات (.xlsx)
            </button>
          </div>
        </div>

        {/* Teachers Export Card */}
        <div className="form-card" style={{ margin: 0, padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                سجلات الكادر والملاكات (EMIS)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                تصدير بيانات المعلمين والمدرسين والموظفين والخدمة
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => importExportService.exportExcel('teachers')}
              className="btn btn-gold btn-sm"
              style={{ flex: 1 }}
            >
              <Download size={15} />
              تصدير سجل الملاكات (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="section-title">
          <Upload size={20} />
          <span>ثانياً: استيراد بيانات من ملف Excel أو CSV</span>
        </div>
        <span className="section-badge">معاينة وفحص التكرار تلقائياً</span>
      </div>

      <div className="form-card">
        {/* Step 1: Select Type & Upload */}
        <div className="grid-2" style={{ alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">تحديد نوع السجلات المراد استيرادها:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="importTarget"
                  checked={targetType === 'students'}
                  onChange={() => { setTargetType('students'); setPreviewData(null); }}
                />
                <span>طالبات المدرسة</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="importTarget"
                  checked={targetType === 'teachers'}
                  onChange={() => { setTargetType('teachers'); setPreviewData(null); }}
                />
                <span>الكادر التدريسي والوظيفي</span>
              </label>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingPreview}
            >
              {loadingPreview ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  جاري قراءة وفحص الملف...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  اختر ملف Excel أو CSV للفحص
                </>
              )}
            </button>
          </div>
        </div>

        {/* Successful Commit Result Banner */}
        {commitResult && (
          <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#065f46', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={28} color="#059669" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{commitResult.message}</div>
              <div style={{ fontSize: '0.88rem', marginTop: '2px' }}>
                تم إنشاء الرموز التعريفية وحفظ السجلات في قاعدة بيانات المدرسة.
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Duplicate Detection (Prompt Section 17) */}
        {previewData && (
          <div style={{ marginTop: '1.5rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  معاينة البيانات قبل الاعتماد النهائي (Preview)
                </h4>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.88rem' }}>
                  <span>إجمالي الصفوف: <strong>{previewData.summary.totalRows}</strong></span>
                  <span style={{ color: '#059669' }}>السجلات الصالحة: <strong>{previewData.summary.validRows}</strong></span>
                  <span style={{ color: '#d97706' }}>السجلات المكررة: <strong>{previewData.summary.duplicateRows}</strong></span>
                  <span style={{ color: '#dc2626' }}>أخطاء بالمدخلات: <strong>{previewData.summary.invalidRows}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                  />
                  <span>تجاوز السجلات المكررة تلقائياً</span>
                </label>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCommit}
                  disabled={committing}
                >
                  {committing ? 'جاري الاعتماد...' : 'تأكيد الاستيراد وحفظ البيانات'}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الحالة</th>
                    <th>الاسم الرباعي الكامل</th>
                    <th>تاريخ التولد</th>
                    <th>الهاتف</th>
                    <th>رقم الوثيقة / الوطنية</th>
                    <th>الملاحظات / التكرار</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: row.isDuplicate ? '#fffbeb' : !row.isValid ? '#fef2f2' : 'inherit' }}>
                      <td>{row.rowIndex}</td>
                      <td>
                        {row.isDuplicate ? (
                          <span className="badge badge-warning">مكرر</span>
                        ) : !row.isValid ? (
                          <span className="badge badge-danger">خطأ</span>
                        ) : (
                          <span className="badge badge-success">صالح</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>{row.quad_name || '-'}</td>
                      <td>{row.dob || '-'}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{row.phone || '-'}</td>
                      <td>{row.national_id || '-'}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {row.isDuplicate && (
                          <div style={{ color: '#b45309', fontWeight: 600 }}>{row.duplicateReason}</div>
                        )}
                        {row.errors && row.errors.length > 0 && (
                          <div style={{ color: '#dc2626' }}>{row.errors.join(' | ')}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Full System Backup & Restore */}
      <div className="section-header" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
        <div className="section-title">
          <Database size={20} />
          <span>ثالثاً: النسخ الاحتياطي الشامل للنظام (Backup & Restore)</span>
        </div>
        <span className="section-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
          حفظ ونقل البيانات بالكامل
        </span>
      </div>

      <div className="form-card" style={{ padding: '1.75rem' }}>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          يمكنك تنزيل نسخة احتياطية مشفرة بملف واحد (JSON) تحتوي على كل سجلات الطالبات والمعلمات والإعدادات لنقلها لحاسوب آخر، أو حفظها في فلاش ميموري للرجوع إليها في أي وقت.
        </p>

        {backupStatus && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            background: backupStatus.success ? '#dcfce7' : backupStatus.loading ? '#eff6ff' : '#fee2e2',
            color: backupStatus.success ? '#15803d' : backupStatus.loading ? '#1d4ed8' : '#b91c1c'
          }}>
            {backupStatus.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateBackup}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} />
            تحميل نسخة احتياطية كاملة (Backup JSON)
          </button>

          <input
            type="file"
            ref={backupInputRef}
            onChange={handleRestoreBackup}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => backupInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Archive size={16} />
            استعادة نسخة احتياطية من ملف
          </button>
        </div>
      </div>
    </div>
  );
}
