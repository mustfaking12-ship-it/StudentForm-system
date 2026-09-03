const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/connection');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'الجلسة منتهية أو الرمز غير صالح. يرجى إعادة الدخول' });
    }

    // Verify user still exists in DB
    const dbUser = db.prepare('SELECT id, username, full_name, role, is_active FROM users WHERE id = ?').get(user.id);
    if (!dbUser || !dbUser.is_active) {
      return res.status(403).json({ success: false, message: 'حساب المستخدم غير فعال أو تم حذفه' });
    }

    req.user = dbUser;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
