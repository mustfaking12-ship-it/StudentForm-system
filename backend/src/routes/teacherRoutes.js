const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateTeacherInput } = require('../middleware/validator');

// Public endpoints
router.post('/check-duplicate', teacherController.checkDuplicate);
router.post('/', validateTeacherInput, teacherController.create);

// Protected endpoints
router.get('/', authenticateToken, teacherController.getAll);
router.get('/:id', teacherController.getById);
router.put('/:id', authenticateToken, teacherController.update);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), teacherController.delete);

module.exports = router;
