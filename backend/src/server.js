const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./config');

// Ensure database and uploads directory exist
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Seed on startup if needed
require('./database/seed');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Setup Multer for personal photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم! يرجى رفع صورة بصيغة JPG أو PNG أو WebP فقط'));
  }
};

const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

// Photo upload API endpoint
app.post('/api/upload', uploadPhoto.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم استلام أي ملف صورة' });
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      photoUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الصورة' });
  }
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/data', require('./routes/importExportRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    school: 'مدرسة المتفوقات الأولى للبنات',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميغابايت' });
    }
  }
  res.status(500).json({
    success: false,
    message: err.message || 'حدث خطأ غير متوقع في الخادم'
  });
});

app.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(`نظام مدرسة المتفوقات الأولى للبنات يعمل بنجاح!`);
  console.log(`الخادم متاح على: http://localhost:${config.PORT}`);
  console.log(`====================================================`);
});
