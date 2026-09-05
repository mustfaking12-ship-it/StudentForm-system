import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import { authService } from '../services/api';

export default function LoginPage({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.login(username, password);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بوابة إدارة المدرسة (تسجيل الدخول)">
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-faint)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}
          >
            <Lock size={32} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
            لوحة تحكم مدير النظام والإدارة
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            الوصول مقتصر على مدير المدرسة والموظفين المصرح لهم لإدارة السجلات والإحصائيات
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            <User size={16} color="var(--primary)" />
            <span>اسم المستخدم</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسم المستخدم"
            required
            autoFocus
            autoComplete="username"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            <KeyRound size={16} color="var(--primary)" />
            <span>كلمة المرور</span>
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
