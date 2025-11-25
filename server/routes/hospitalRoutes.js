const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

// Get hospitals list
router.get('/', hospitalController.getHospitals);

// Get doctors by hospital
router.get('/:hospitalId/doctors', hospitalController.getDoctorsByHospital);

// Get internships for a hospital
router.get('/:id/internships', hospitalController.getHospitalInternships);

// Create internship for a hospital
router.post('/:id/internships', hospitalController.createInternship);

module.exports = router;