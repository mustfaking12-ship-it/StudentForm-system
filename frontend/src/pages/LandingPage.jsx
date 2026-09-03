import React, { useState } from 'react';
import { GraduationCap, Briefcase, Search, ArrowLeft, Shield, FileCheck2, Sparkles, Building2 } from 'lucide-react';

export default function LandingPage({ onSelectStudent, onSelectTeacher, onTrackCode, onOpenLogin }) {
  const [trackInput, setTrackInput] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onTrackCode(trackInput.trim());
    }
  };

  return (
    <div className="hero-portal">
      {/* Official School Hero Banner */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(11, 37, 69, 0.08)', padding: '0.4rem 1rem', borderRadius: '9999px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        <Sparkles size={16} color="var(--accent-gold)" />
        <span>وزارة التربية العراقية | استمارات نظام EMIS المعتمدة</span>
      </div>

      <h1 className="portal-title">
        مدرسة المتفوقات الأولى للبنات
      </h1>

      <p className="portal-subtitle">
        مرحباً بكم في البوابة الإلكترونية الرسمية لملء وإدارة استمارات قيد وبيانات الطالبات والملاكات التدريسية والإدارية. يرجى اختيار نوع الاستمارة للمتابعة:
      </p>

      {/* The Two Main Action Cards (Prompt Requirement 1) */}
      <div className="cards-selection-grid">
        {/* Card 1: Student Form */}
        <div
          className="portal-card portal-card-student"
          onClick={onSelectStudent}
          role="button"
          tabIndex={0}
        >
          <div className="portal-card-icon">
            <GraduationCap size={52} strokeWidth={1.75} />
          </div>

          <h2 className="portal-card-title">
            استمارة معلومات طالبة
          </h2>

          <p className="portal-card-desc">
            تسجيل قيد طالبة جديدة أو تحديث بيانات طالبة مستمرة، تشمل المعلومات الشخصية، وثائق الهوية، السكن، القيد الدراسي، ومعلومات ولي الأمر.
          </p>

          <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <span>بدء ملء استمارة الطالبة</span>
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Card 2: Teacher / Staff Form */}
        <div
          className="portal-card portal-card-teacher"
          onClick={onSelectTeacher}
          role="button"
          tabIndex={0}
        >
          <div className="portal-card-icon">
            <Briefcase size={52} strokeWidth={1.75} />
          </div>

          <h2 className="portal-card-title">
            استمارة مدرس / موظف
          </h2>

          <p className="portal-card-desc">
            استمارة معلومات الموظفين والمعلمين لنظام EMIS الوزاري، تشمل المعلومات الوظيفية، التحصيل الدراسي، التخصص، السكن، وتفاصيل الخدمة.
          </p>

          <button type="button" className="btn btn-gold btn-lg" style={{ width: '100%' }}>
            <span>بدء ملء استمارة المدرس / الموظف</span>
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* Quick Tracking & Lookup Box */}
      <div style={{ maxWidth: '650px', margin: '4rem auto 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
          <Search size={20} />
          <span>الاستعلام ومتابعة استمارة مسجلة مسبقاً</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
          إذا كنت قد قدمت استمارة مسبقاً، يمكنك إدخال الرمز الإلكتروني الصادر (مثل: STU-000001 أو TEA-000001) لعرض الاستمارة وطباعتها:
        </p>
        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="أدخل الرمز الإلكتروني هنا (مثال: STU-000001)..."
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            style={{ direction: 'ltr', textAlign: 'right', fontWeight: 600 }}
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            استعلام
          </button>
        </form>
      </div>

      {/* Admin Gateway Bar */}
      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenLogin}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Shield size={16} color="var(--primary)" />
          <span>بوابة إدارة المدرسة (خاص بالمدير والموظفين المصرح لهم)</span>
        </button>
      </div>
    </div>
  );
}
