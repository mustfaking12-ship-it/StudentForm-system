import React, { useState, useRef, useEffect } from 'react';
import { Bell, GraduationCap, Briefcase, Check, Trash2, ExternalLink, X } from 'lucide-react';

export default function NotificationBell({ notifications = [], onMarkAllAsRead, onClearAll, onViewRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (notif) => {
    notif.read = true;
    setIsOpen(false);
    if (onViewRecord && notif.record) {
      onViewRecord(notif.record.id || notif.record.code, notif.type || 'student');
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'الآن';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return new Date(timestamp).toLocaleDateString('ar-IQ');
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '8px',
          color: '#ffffff',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="الإشعارات اللحظية"
      >
        <Bell size={18} className={unreadCount > 0 ? 'bell-ringing' : ''} />

        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: '#ffffff',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 5px rgba(239, 68, 68, 0.6)',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '340px',
          maxWidth: '90vw',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          zIndex: 1100,
          direction: 'rtl',
          overflow: 'hidden',
          animation: 'fadeInSlide 0.2s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '0.85rem 1rem',
            background: 'var(--primary, #0b2545)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem' }}>
              <Bell size={16} />
              <span>الإشعارات اللحظية</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem'
                }}>
                  {unreadCount} جديد
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title="تحديد الكل كمقروء"
                >
                  <Check size={13} />
                  مقروء
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{
            maxHeight: '360px',
            overflowY: 'auto',
            divideY: '1px solid #f1f5f9'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>لا توجد إشعارات جديدة</p>
                <small style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>ستصلك التنبيهات هنا فور تسجيل أي طالبة</small>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    background: notif.read ? '#ffffff' : '#f0f9ff',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? '#ffffff' : '#f0f9ff'}
                >
                  {/* Icon */}
                  <div style={{
                    background: notif.type === 'teacher' ? '#fef3c7' : '#e0f2fe',
                    color: notif.type === 'teacher' ? '#b45309' : '#0369a1',
                    padding: '8px',
                    borderRadius: '8px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    {notif.type === 'teacher' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: notif.read ? 600 : 800,
                      color: notif.read ? '#334155' : '#0f172a',
                      marginBottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          flexShrink: 0
                        }} />
                      )}
                    </div>

                    <p style={{
                      margin: '0 0 4px',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      lineHeight: 1.4
                    }}>
                      {notif.message}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: '#94a3b8'
                    }}>
                      <span>{formatTimeAgo(notif.timestamp)}</span>
                      <span style={{
                        color: 'var(--primary, #0b2545)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        معاينة <ExternalLink size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '0.6rem 1rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                مربوط بالسحابة المركزية
              </span>
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Trash2 size={12} />
                مسح السجل
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
