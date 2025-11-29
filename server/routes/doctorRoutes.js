const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');

// Apply authentication to all routes
router.use(verifyToken);

// GET /api/doctors/internships
router.get('/internships', doctorController.getDoctorInternships);

// GET /api/doctors/internship/:internshipId/applicants
router.get('/internship/:internshipId/applicants', doctorController.getInternshipApplicants);

// GET /api/doctors/trainees
router.get('/trainees', doctorController.getMyTrainees);

module.exports = router;