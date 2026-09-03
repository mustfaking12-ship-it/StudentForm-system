const express = require('express');
const router = express.Router();
const multer = require('multer');
const importExportController = require('../controllers/importExportController');
const { authenticateToken } = require('../middleware/auth');

// Memory storage for Excel upload preview & parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/export', authenticateToken, importExportController.exportRecords);
router.post('/import/preview', authenticateToken, upload.single('file'), importExportController.previewImport);
router.post('/import/commit', authenticateToken, importExportController.commitImport);

module.exports = router;
