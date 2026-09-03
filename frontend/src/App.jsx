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
import { getUser, studentService, teacherService } from './services/api';
import './styles/main.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(getUser());
  const [toasts, setToasts] = useState([]);

  // Selected records for details / print / edit
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentRecordType, setCurrentRecordType] = useState('student');
  const [editModalData, setEditModalData] = useState({ isOpen: false, record: null, type: 'student' });

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

      {/* Toast Notifications System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
