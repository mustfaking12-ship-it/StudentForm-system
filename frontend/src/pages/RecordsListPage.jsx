import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  PlusCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { studentService, teacherService, importExportService, getUser } from '../services/api';

const GRADES = [
  'الأول متوسط',
  'الثاني متوسط',
  'الثالث متوسط',
  'الرابع العلمي',
  'الخامس العلمي',
  'السادس العلمي'
];

export default function RecordsListPage({ onViewRecord, onEditRecord, onPrintRecord, onNewRecord }) {
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'teachers'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filter states
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search.trim(),
          grade: gradeFilter,
          study_stage: stageFilter,
          student_status: statusFilter,
          gender: genderFilter
        };
        const res = await studentService.getAll(params);
        if (res.success) {
          setRecords(res.data || []);
          setPagination(res.pagination || { page: 1, limit: 15, total: res.data?.length || 0, totalPages: 1 });
        }
      } else {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search.trim(),
          staff_category: categoryFilter,
          gender: genderFilter
        };
        const res = await teacherService.getAll(params);
        if (res.success) {
          setRecords(res.data || []);
          setPagination(res.pagination || { page: 1, limit: 15, total: res.data?.length || 0, totalPages: 1 });
        }
      }
    } catch (err) {
      console.error('Fetch records error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, search, gradeFilter, stageFilter, statusFilter, genderFilter, categoryFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset page when filters or tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
    setGradeFilter('');
    setStageFilter('');
    setStatusFilter('');
    setGenderFilter('');
    setCategoryFilter('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'student') {
        await studentService.delete(deleteTarget.id);
      } else {
        await teacherService.delete(deleteTarget.id);
      }
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'فشل حذف السجل');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="records-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
            إدارة السجلات والمعلومات
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
            سجلات الطالبات والكادر التدريسي والإداري لمدرسة المتفوقات الأولى للبنات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => importExportService.exportExcel(activeTab === 'students' ? 'students' : 'teachers')}
            className="btn btn-sm btn-secondary"
          >
            <FileSpreadsheet size={16} />
            تصدير إلى Excel
          </button>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onNewRecord(activeTab === 'students' ? 'student' : 'teacher')}
          >
            <PlusCircle size={16} />
            إضافة سجل جديد
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => handleTabChange('students')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            borderBottom: activeTab === 'students' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'students' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>سجلات الطالبات</span>
          <span className="badge badge-primary">{activeTab === 'students' ? pagination.total : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('teachers')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            borderBottom: activeTab === 'teachers' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'teachers' ? 'var(--primary)' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>الملاك التدريسي والوظيفي</span>
          <span className="badge badge-warning">{activeTab === 'teachers' ? pagination.total : ''}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="form-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="grid-4">
          {/* Smart Search Input */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="بحث ذكي بالاسم الرباعي، الرمز، رقم الهاتف، أو رقم الهوية..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                style={{ paddingRight: '2.5rem' }}
              />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '13px' }} />
            </div>
          </div>

          {activeTab === 'students' ? (
            <>
              <select
                className="form-control"
                value={gradeFilter}
                onChange={(e) => { setGradeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <option value="">كل الصفوف الدراسية</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <option value="">كل الحالات</option>
                <option value="مستمرة">مستمرة</option>
                <option value="منقولة">منقولة</option>
                <option value="متخرجة">متخرجة</option>
                <option value="مفصولة">مفصولة</option>
              </select>
            </>
          ) : (
            <>
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <option value="">كل الكوادر</option>
                <option value="تدريسي">تدريسي</option>
                <option value="إداري">إداري</option>
                <option value="فني">فني</option>
                <option value="خدمي">خدمي</option>
              </select>

              <select
                className="form-control"
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              >
                <option value="">كل الأجناس</option>
                <option value="أنثى">أنثى</option>
                <option value="ذكر">ذكر</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>الرقم التعريفي</th>
                <th>الاسم الرباعي الكامل</th>
                <th>نوع السجل</th>
                <th>الجنس</th>
                <th>الهاتف</th>
                <th>{activeTab === 'students' ? 'الصف والشعبة' : 'المسمى الوظيفي'}</th>
                <th>الحالة</th>
                <th style={{ textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ color: '#64748b' }}>جاري تحميل البيانات...</div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                    <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 700, color: '#475569' }}>لا توجد سجلات مطابقة لمعايير البحث</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                      يمكنك إعادة تعيين الفلاتر أو كتابة اسم آخر
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((item) => {
                  const isStu = activeTab === 'students';
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className={`badge ${isStu ? 'badge-primary' : 'badge-warning'}`}>
                          {item.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                        {item.quad_name}
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {isStu ? 'طالبة' : (item.staff_category || 'تدريسي')}
                        </span>
                      </td>
                      <td>{item.gender || 'أنثى'}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>
                        {item.phone}
                      </td>
                      <td>
                        {isStu ? `${item.grade} (${item.section})` : (item.job_title || 'مدرس')}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {isStu ? (item.student_status || 'مستمرة') : (item.employment_status || 'مستمر')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => onViewRecord(item.id, isStu ? 'student' : 'teacher')}
                            title="عرض التفاصيل"
                          >
                            <Eye size={15} />
                            عرض
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => onEditRecord(item, isStu ? 'student' : 'teacher')}
                            title="تعديل السجل"
                          >
                            <Edit2 size={15} />
                            تعديل
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => onPrintRecord(item, isStu ? 'student' : 'teacher')}
                            title="طباعة الاستمارة الرسمية A4"
                          >
                            <Printer size={15} />
                            طباعة
                          </button>

                          {currentUser && currentUser.role === 'ADMIN' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleteTarget({ id: item.id, name: item.quad_name, code: item.code, type: isStu ? 'student' : 'teacher' })}
                              title="حذف السجل"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
              عرض صفحة {pagination.page} من {pagination.totalPages} (إجمالي {pagination.total} سجل)
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                السابق
              </button>

              <button
                type="button"
                className="btn btn-sm btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isDanger={true}
          loading={deleting}
          title="تأكيد حذف السجل"
          message={`هل أنت متأكد من رغبتك في حذف سجل (${deleteTarget.code} - ${deleteTarget.name}) نهائياً من قاعدة البيانات؟`}
          confirmText="حذف نهائي"
        />
      )}
    </div>
  );
}
