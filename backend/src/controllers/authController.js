const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const config = require('../config');

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'الحساب معطل، يرجى مراجعة إدارة المدرسة' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record login in audit_logs
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, details, ip_address)
        VALUES (?, ?, 'LOGIN', 'AUTH', 'تسجيل دخول ناجح للمستخدم', ?)
      `).run(user.id, user.username, req.ip || '');
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' });
  }
};

exports.getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
