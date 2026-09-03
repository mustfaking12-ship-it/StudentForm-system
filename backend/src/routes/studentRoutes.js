const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateStudentInput } = require('../middleware/validator');

// Public endpoints (no login needed for public student form registration & duplicate check)
router.post('/check-duplicate', studentController.checkDuplicate);
router.post('/', validateStudentInput, studentController.create);

// Protected endpoints (Management / Admin)
router.get('/', authenticateToken, studentController.getAll);
router.get('/:id', studentController.getById); // Allow fetching receipt by code/id
router.put('/:id', authenticateToken, studentController.update);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), studentController.delete);

module.exports = router;
