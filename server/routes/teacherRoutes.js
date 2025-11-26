const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const teacherController = require('../controllers/teacherController');

// Assign teacher to internship
router.post('/assign', verifyToken, teacherController.assignTeacherToInternship);

// Get teacher's internships
router.get('/internships', verifyToken, teacherController.getTeacherInternships);

module.exports = router;

