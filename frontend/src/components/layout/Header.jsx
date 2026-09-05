import React from 'react';
import { ShieldCheck, LogIn, LogOut, LayoutDashboard, FileText, Users, Home, Settings } from 'lucide-react';
import { getUser, authService } from '../../services/api';

export default function Header({ currentView, setCurrentView, onOpenLogin, onOpenSettings }) {
  const user = getUser();

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const todayArabic = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="official-header">
      <div className="header-top-bar">
        <div>جمهورية العراق - وزارة التربية | المديرية العامة للتربية | نظام استمارات EMIS</div>
        <div>{todayArabic}</div>
      </div>

      <div className="header-main-nav">
        <div className="school-brand" onClick={() => setCurrentView('landing')}>
          <img src="/emblem.svg" alt="شعار المدرسة" className="school-emblem" />
          <div className="brand-text">
            <h1>مدرسة المتفوقات الأولى للبنات</h1>
            <p>نظام تسجيل وإدارة معلومات الطالبات والملاكات التعليمية والإدارية</p>
          </div>
        </div>

        <nav className="nav-actions">
          <button
            className={`btn btn-sm ${currentView === 'landing' ? 'btn-gold' : 'btn-outline-light'}`}
            onClick={() => setCurrentView('landing')}
          >
            <Home size={16} />
            الرئيسية
          </button>

          {user ? (
            <>
              <button
                className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-gold' : 'btn-outline-light'}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </button>

              <button
                className={`btn btn-sm ${currentView === 'records' ? 'btn-gold' : 'btn-outline-light'}`}
                onClick={() => setCurrentView('records')}
              >
                <Users size={16} />
                إدارة السجلات
              </button>

              <button
                className={`btn btn-sm ${currentView === 'import-export' ? 'btn-gold' : 'btn-outline-light'}`}
                onClick={() => setCurrentView('import-export')}
              >
                <FileText size={16} />
                الاستيراد والتصدير
              </button>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={onOpenSettings}
                title="إعدادات النظام والتيليجرام"
              >
                <Settings size={16} />
                الإعدادات
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#f6d365', fontWeight: 'bold' }}>
                  {user.full_name || user.username}
                </span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                >
                  <LogOut size={15} />
                  خروج
                </button>
              </div>
            </>
          ) : (
            <button
              className="btn btn-sm btn-gold"
              onClick={onOpenLogin}
            >
              <LogIn size={16} />
              بوابة الإدارة
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
