const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'student_documents'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload a document (student must be authenticated)
router.post('/documents', verifyToken, upload.single('file'), studentController.uploadDocument);

// List student documents (authenticated)
router.get('/documents', verifyToken, studentController.getStudentDocuments);

// Get student documents by student_id (for hospitals/admins)
router.get('/:studentId/documents', verifyToken, studentController.getStudentDocumentsByStudentId);

// Save or update student profile (authenticated)
router.post('/profile', verifyToken, studentController.saveStudentProfile);

// Get student profile data (authenticated)
router.get('/profile', verifyToken, studentController.getStudentProfileData);

// Student profile and internships (used by frontend)
router.get('/:studentId/profile', studentController.getStudentProfile);
router.get('/:studentId/internships', studentController.getStudentInternships);

module.exports = router;
