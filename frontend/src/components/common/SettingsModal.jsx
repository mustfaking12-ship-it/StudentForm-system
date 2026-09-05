import React, { useState, useEffect } from 'react';
import { X, Send, Save, CheckCircle, AlertCircle, Shield, Bell, Cloud, Database } from 'lucide-react';
import { getSettings, saveSettings } from '../../services/settingsService';
import { testTelegramConnection } from '../../services/telegramService';
import { resetFirebaseInstance } from '../../services/firebaseService';

export default function SettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [activeTab, setActiveTab] = useState('telegram');
  const [settings, setSettings] = useState(getSettings());
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
      setTelegramStatus(null);
      setSaveStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const res = saveSettings(settings);
    if (res.success) {
      resetFirebaseInstance();
      setSaveStatus({ success: true, message: 'تم حفظ كافة الإعدادات بنجاح!' });
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 1200);
    } else {
      setSaveStatus({ success: false, message: res.message || 'فشل حفظ الإعدادات' });
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      setTelegramStatus({ success: false, message: 'يرجى إدخال التوكن ومعرف الشات أولاً' });
      return;
    }

    setTestingTelegram(true);
    setTelegramStatus(null);
    try {
      const res = await testTelegramConnection(settings.telegramBotToken, settings.telegramChatId);
      setTelegramStatus(res);
    } catch (err) {
      setTelegramStatus({ success: false, message: err.message || 'فشل الاتصال بتيليجرام' });
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="modal-content" style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        direction: 'rtl'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
              إعدادات النظام والربط الإلكتروني
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              ضبط بوت التيليجرام، المزامنة السحابية، وكلمة مرور لوحة التحكم
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            style={{
              padding: '0.85rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'telegram' ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === 'telegram' ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Bell size={16} />
            إشعارات التيليجرام
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            style={{
              padding: '0.85rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'cloud' ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === 'cloud' ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Cloud size={16} />
            قاعدة البيانات السحابية (Firebase)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.85rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: activeTab === 'security' ? 'var(--primary)' : '#64748b',
              borderBottom: activeTab === 'security' ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Shield size={16} />
            كلمة المرور
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
          {/* TAB 1: TELEGRAM */}
          {activeTab === 'telegram' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                color: '#1e40af',
                lineHeight: 1.6
              }}>
                ℹ️ <strong>كيف تحصل على بيانات التيليجرام مجاناً؟</strong><br />
                1. افتح تطبيق تيليجرام وابحث عن <b>@BotFather</b> ثم اكتب <code>/newbot</code> وانسخ الـ <b>HTTP API Token</b>.<br />
                2. ابحث عن <b>@userinfobot</b> لمعرفة رقم الـ <b>Chat ID</b> الخاص بحسابك.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  توكن البوت (Bot Token) *:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 7123456789:AAHq_kM_..."
                  value={settings.telegramBotToken || ''}
                  onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  معرف الشات / القناة (Chat ID) *:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 123456789 أو -100123456789 للقنوات"
                  value={settings.telegramChatId || ''}
                  onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {/* Test Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={14} />
                  {testingTelegram ? 'جاري إرسال التجربة...' : 'إرسال رسالة تجريبية للتأكد'}
                </button>

                {telegramStatus && (
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: telegramStatus.success ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {telegramStatus.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {telegramStatus.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLOUD FIREBASE */}
          {activeTab === 'cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                color: '#166534',
                lineHeight: 1.6
              }}>
                ☁️ <strong>المزامنة السحابية (اختيارية):</strong><br />
                النظام يحفظ البيانات في المتصفح المحلي حالياً. إذا رغبت بمزامنة الاستمارات سحابياً بين جميع هواتف الطلاب وحاسوبك فورياً، يمكنك إدخال مفاتيح مشروعك المجاني من <b>Google Firebase Console</b>.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Firebase Project ID:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: my-school-emis-123"
                  value={settings.firebaseConfig?.projectId || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    firebaseConfig: { ...settings.firebaseConfig, projectId: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Firebase API Key:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="AIzaSy..."
                  value={settings.firebaseConfig?.apiKey || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    firebaseConfig: { ...settings.firebaseConfig, apiKey: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PASSWORD */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  كلمة مرور لوحة تحكم الإدارة (Admin Password):
                </label>
                <input
                  type="text"
                  value={settings.adminPassword || ''}
                  onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                  الافتراضية: <code>admin123</code> (تُستخدم لتسجيل دخول الإدارة)
                </small>
              </div>
            </div>
          )}

          {/* Feedback & Footer */}
          {saveStatus && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: saveStatus.success ? '#dcfce7' : '#fee2e2',
              color: saveStatus.success ? '#15803d' : '#b91c1c'
            }}>
              {saveStatus.message}
            </div>
          )}

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} />
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
