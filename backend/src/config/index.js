require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'al-mutafawwiqat-secret-key-2026-safe-token',
  DB_PATH: path.join(__dirname, '../../database/school_system.db'),
  UPLOAD_DIR: path.join(__dirname, '../../uploads')
};
