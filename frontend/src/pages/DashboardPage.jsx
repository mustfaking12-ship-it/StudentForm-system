import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  HeartHandshake,
  Layers,
  ArrowUpRight,
  Printer,
  Eye,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dashboardService } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage({ onNavigate, onViewRecord }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>جاري تحميل إحصائيات مدرسة المتفوقات الأولى للبنات...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 700 }}>{error || 'تعذر تحميل الإحصائيات'}</p>
        <button type="button" className="btn btn-primary" onClick={loadDashboardData} style={{ marginTop: '1rem' }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Chart 1: Grade Breakdown
  const gradeLabels = (stats.studentsByGrade || []).map(g => g.grade);
  const gradeCounts = (stats.studentsByGrade || []).map(g => g.count);

  const gradeChartData = {
    labels: gradeLabels.length ? gradeLabels : ['لا توجد بيانات'],
    datasets: [
      {
        label: 'عدد الطالبات',
        data: gradeCounts.length ? gradeCounts : [0],
        backgroundColor: '#0b2545',
        borderRadius: 6
      }
    ]
  };

  // Chart 2: Gender Breakdown
  const genderChartData = {
    labels: ['الإناث', 'الذكور'],
    datasets: [
      {
        data: [stats.totalFemales, stats.totalMales],
        backgroundColor: ['#c59b27', '#0b2545'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
            لوحة تحكم إدارة مدرسة المتفوقات الأولى للبنات
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
            ملخص شامل ومباشر لبيانات الطالبات والملاكات التعليمية والإدارية
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm btn-secondary" onClick={loadDashboardData}>
            <RefreshCw size={15} />
            تحديث
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => onNavigate('records')}>
            <Users size={15} />
            إدارة السجلات
          </button>
          <button type="button" className="btn btn-sm btn-gold" onClick={() => onNavigate('import-export')}>
            <FileSpreadsheet size={15} />
            تصدير / استيراد Excel
          </button>
        </div>
      </div>

      {/* 6 Required Metric Cards (Prompt Section 13) */}
      <div className="stats-grid">
        {/* Total Records */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalRecords}</div>
            <div className="stat-title">عدد السجلات الكلي</div>
          </div>
          <div className="stat-icon" style={{ background: '#eef4f9', color: '#0b2545' }}>
            <Layers size={26} />
          </div>
        </div>

        {/* Total Students */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-title">عدد الطالبات</div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <GraduationCap size={26} />
          </div>
        </div>

        {/* Total Teachers */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-title">عدد المدرسين</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Briefcase size={26} />
          </div>
        </div>

        {/* Total Staff */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalStaff}</div>
            <div className="stat-title">عدد الموظفين</div>
          </div>
          <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <UserCheck size={26} />
          </div>
        </div>

        {/* Total Females */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalFemales}</div>
            <div className="stat-title">عدد الإناث</div>
          </div>
          <div className="stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Total Males */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.totalMales}</div>
            <div className="stat-title">عدد الذكور</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <Users size={26} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Students by Grade Bar Chart */}
        <div className="form-card" style={{ padding: '1.5rem', margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <div className="section-title" style={{ fontSize: '1.05rem' }}>
              <span>توزيع الطالبات حسب الصف الدراسي</span>
            </div>
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bar
              data={gradeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        {/* Gender Breakdown Doughnut Chart */}
        <div className="form-card" style={{ padding: '1.5rem', margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <div className="section-title" style={{ fontSize: '1.05rem' }}>
              <span>التوزيع النسبي حسب الجنس</span>
            </div>
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={genderChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="form-card" style={{ padding: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.25rem' }}>
          <div className="section-title" style={{ fontSize: '1.1rem' }}>
            <span>أحدث السجلات المضافة مؤخراً</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => onNavigate('records')}
          >
            <span>عرض كل السجلات</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>الاسم الرباعي الكامل</th>
                <th>النوع</th>
                <th>الصف / الوظيفة</th>
                <th>الهاتف</th>
                <th>تاريخ التسجيل</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentStudents.map((stu) => (
                <tr key={`stu-${stu.id}`}>
                  <td><span className="badge badge-primary">{stu.code}</span></td>
                  <td style={{ fontWeight: 700 }}>{stu.quad_name}</td>
                  <td><span className="badge badge-info">طالبة</span></td>
                  <td>{stu.grade} ({stu.section})</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{stu.phone}</td>
                  <td>{new Date(stu.created_at).toLocaleDateString('ar-IQ')}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => onViewRecord(stu.id, 'student')}
                    >
                      <Eye size={14} />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}

              {stats.recentStaff.map((tea) => (
                <tr key={`tea-${tea.id}`}>
                  <td><span className="badge badge-warning">{tea.code}</span></td>
                  <td style={{ fontWeight: 700 }}>{tea.quad_name}</td>
                  <td><span className="badge badge-success">{tea.staff_category || 'تدريسي'}</span></td>
                  <td>{tea.job_title || 'مدرس'}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{tea.phone}</td>
                  <td>{new Date(tea.created_at).toLocaleDateString('ar-IQ')}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => onViewRecord(tea.id, 'teacher')}
                    >
                      <Eye size={14} />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
