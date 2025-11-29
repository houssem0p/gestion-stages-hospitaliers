const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get hospitals list (public)
router.get('/', hospitalController.getHospitals);

// Get doctors by hospital (authenticated)
router.get('/:hospitalId/doctors', verifyToken, hospitalController.getDoctorsByHospital);

// Get internships for a hospital (authenticated)
router.get('/:id/internships', verifyToken, hospitalController.getHospitalInternships);

// Create internship for a hospital (authenticated)
router.post('/:id/internships', verifyToken, hospitalController.createInternship);

module.exports = router;