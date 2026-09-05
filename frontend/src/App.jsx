import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Toast from './components/layout/Toast';
import LandingPage from './pages/LandingPage';
import StudentFormPage from './pages/StudentFormPage';
import TeacherFormPage from './pages/TeacherFormPage';
import SuccessReceiptPage from './pages/SuccessReceiptPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecordsListPage from './pages/RecordsListPage';
import RecordDetailsPage from './pages/RecordDetailsPage';
import ImportExportPage from './pages/ImportExportPage';
import StudentPrintA4 from './components/print/StudentPrintA4';
import TeacherPrintA4 from './components/print/TeacherPrintA4';
import EditRecordModal from './components/common/EditRecordModal';
import SettingsModal from './components/common/SettingsModal';
import { getUser, studentService, teacherService } from './services/api';
import { subscribeToNewStudents, subscribeToNewTeachers } from './services/firebaseService';
import { playNotificationChime, requestNotificationPermission, showDesktopNotification } from './utils/notificationSound';
import './styles/main.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(getUser());
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('emis_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Selected records for details / print / edit
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentRecordType, setCurrentRecordType] = useState('student');
  const [editModalData, setEditModalData] = useState({ isOpen: false, record: null, type: 'student' });

  // Persist notifications to local storage
  useEffect(() => {
    try {
      localStorage.setItem('emis_notifications', JSON.stringify(notifications.slice(0, 35)));
    } catch (e) {}
  }, [notifications]);

  // Real-time Firestore Subscriptions for new student & staff submissions
  useEffect(() => {
    if (!user) return;

    // Smoothly request desktop permission if supported
    requestNotificationPermission().catch(() => {});

    // Listen for new student registrations
    const unsubStudents = subscribeToNewStudents((student) => {
      // 1. Play chime sound
      playNotificationChime();

      // 2. Desktop notification
      showDesktopNotification(
        '🎓 استمارة طالبة جديدة!',
        `تم تسجيل: ${student.quad_name || 'طالبة جديدة'} (${student.grade || 'الأول متوسط'})`,
        () => handleViewRecord(student.code || student.id, 'student')
      );

      // 3. Add to notifications center list
      const notif = {
        id: 'stu-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: `طالبة جديدة: ${student.quad_name}`,
        message: `${student.grade || 'الأول متوسط'} (${student.section || 'أ'}) - الرمز: ${student.code}`,
        type: 'student',
        record: student,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);

      // 4. Show live toast
      addToast(
        `تم تسجيل: ${student.quad_name} (${student.grade || 'طالبة'}) - الرمز: ${student.code}`,
        'success',
        '🔔 استمارة طالبة جديدة!'
      );
    });

    // Listen for new staff/teacher additions
    const unsubTeachers = subscribeToNewTeachers((teacher) => {
      playNotificationChime();

      showDesktopNotification(
        '👩‍🏫 استمارة كادر جديدة!',
        `تمت إضافة: ${teacher.quad_name || 'موظف/معلم'} (${teacher.job_title || ''})`,
        () => handleViewRecord(teacher.code || teacher.id, 'teacher')
      );

      const notif = {
        id: 'tea-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: `كادر جديد: ${teacher.quad_name}`,
        message: `${teacher.staff_category || 'تدريسي'} - ${teacher.job_title || ''} - الرمز: ${teacher.code}`,
        type: 'teacher',
        record: teacher,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);

      addToast(
        `تمت إضافة: ${teacher.quad_name} (${teacher.job_title || ''})`,
        'info',
        '🔔 تسجيل كادر جديد!'
      );
    });

    return () => {
      unsubStudents();
      unsubTeachers();
    };
  }, [user]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const addToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
    addToast('مرحباً بك في لوحة تحكم إدارة المدرسة', 'success', 'تم الدخول بنجاح');
  };

  // Form completion handler
  const handleFormSubmitted = (record, type) => {
    setCurrentRecord(record);
    setCurrentRecordType(type);
    setCurrentView('success-receipt');
    addToast(`تم إصدار الرقم الإلكتروني: ${record.code}`, 'success', 'اكتمل التسجيل');
  };

  // Track code lookup from landing page
  const handleTrackCode = async (code) => {
    const upper = code.trim().toUpperCase();
    try {
      if (upper.startsWith('STU')) {
        const res = await studentService.getById(upper);
        if (res.success && res.data) {
          setCurrentRecord(res.data);
          setCurrentRecordType('student');
          setCurrentView('details');
        }
      } else if (upper.startsWith('TEA')) {
        const res = await teacherService.getById(upper);
        if (res.success && res.data) {
          setCurrentRecord(res.data);
          setCurrentRecordType('teacher');
          setCurrentView('details');
        }
      } else {
        // Try searching both
        try {
          const sRes = await studentService.getById(upper);
          if (sRes.success) {
            setCurrentRecord(sRes.data);
            setCurrentRecordType('student');
            setCurrentView('details');
            return;
          }
        } catch (e) {}

        const tRes = await teacherService.getById(upper);
        if (tRes.success) {
          setCurrentRecord(tRes.data);
          setCurrentRecordType('teacher');
          setCurrentView('details');
          return;
        }
      }
    } catch (err) {
      addToast('لم يتم العثور على سجل بالرمز المدخل', 'danger', 'خطأ في الاستعلام');
    }
  };

  const handleViewRecord = (id, type) => {
    setCurrentRecord({ id });
    setCurrentRecordType(type);
    setCurrentView('details');
  };

  const handleEditRecord = (record, type) => {
    setEditModalData({ isOpen: true, record, type });
  };

  const handlePrintRecord = (record, type) => {
    setCurrentRecord(record);
    setCurrentRecordType(type);
    setCurrentView('print-a4');
  };

  return (
    <div className="app-container">
      {/* Official Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAllNotifications={handleClearAllNotifications}
        onViewRecord={(id, type) => handleViewRecord(id, type)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'landing' && (
          <LandingPage
            onSelectStudent={() => setCurrentView('student-form')}
            onSelectTeacher={() => setCurrentView('teacher-form')}
            onTrackCode={handleTrackCode}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentView === 'student-form' && (
          <StudentFormPage
            onCancel={() => setCurrentView('landing')}
            onSuccess={(record) => handleFormSubmitted(record, 'student')}
            onViewExistingRecord={(id) => handleViewRecord(id, 'student')}
          />
        )}

        {currentView === 'teacher-form' && (
          <TeacherFormPage
            onCancel={() => setCurrentView('landing')}
            onSuccess={(record) => handleFormSubmitted(record, 'teacher')}
            onViewExistingRecord={(id) => handleViewRecord(id, 'teacher')}
          />
        )}

        {currentView === 'success-receipt' && (
          <SuccessReceiptPage
            record={currentRecord}
            type={currentRecordType}
            onPrintA4={(rec, type) => handlePrintRecord(rec, type)}
            onGoHome={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onNavigate={(view) => setCurrentView(view)}
            onViewRecord={handleViewRecord}
          />
        )}

        {currentView === 'records' && (
          <RecordsListPage
            onViewRecord={handleViewRecord}
            onEditRecord={handleEditRecord}
            onPrintRecord={handlePrintRecord}
            onNewRecord={(type) => setCurrentView(type === 'student' ? 'student-form' : 'teacher-form')}
          />
        )}

        {currentView === 'details' && currentRecord && (
          <RecordDetailsPage
            recordId={currentRecord.id || currentRecord.code}
            recordType={currentRecordType}
            onBack={() => setCurrentView(user ? 'records' : 'landing')}
            onEdit={(rec, type) => handleEditRecord(rec, type)}
          />
        )}

        {currentView === 'print-a4' && currentRecord && (
          currentRecordType === 'student' ? (
            <StudentPrintA4
              student={currentRecord}
              onBack={() => setCurrentView(user ? 'records' : 'landing')}
            />
          ) : (
            <TeacherPrintA4
              teacher={currentRecord}
              onBack={() => setCurrentView(user ? 'records' : 'landing')}
            />
          )
        )}

        {currentView === 'import-export' && (
          <ImportExportPage />
        )}
      </main>

      {/* Official Footer */}
      <footer className="official-footer no-print" style={{ background: 'var(--primary)', color: '#ffffff', padding: '1.5rem', textAlign: 'center', borderTop: '3px solid var(--accent-gold)', marginTop: 'auto', fontSize: '0.86rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>مدرسة المتفوقات الأولى للبنات</strong> | وزارة التربية – جمهورية العراق
          </div>
          <div style={{ color: '#cbd5e1' }}>
            نظام إدارة الاستمارات الإلكتروني المعتمد لنظام EMIS &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Edit Record Modal */}
      <EditRecordModal
        isOpen={editModalData.isOpen}
        record={editModalData.record}
        type={editModalData.type}
        onClose={() => setEditModalData({ isOpen: false, record: null, type: 'student' })}
        onSaveSuccess={(updated) => {
          addToast('تم تحديث بيانات السجل بنجاح', 'success', 'تحديث السجل');
          setCurrentRecord(updated);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSuccess={() => {
          addToast('تم حفظ إعدادات النظام بنجاح', 'success', 'الإعدادات');
        }}
      />

      {/* Toast Notifications System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
