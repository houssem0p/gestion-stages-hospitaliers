const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { verifyToken } = require('../middleware/authMiddleware');
const applicationsController = require('../controllers/applicationsController');

// List all internships (public) - for students
router.get('/', hospitalController.listAllInternships);

// Get single internship by id
router.get('/:id', hospitalController.getInternshipById);

// Update internship
router.put('/:id', hospitalController.updateInternship);

// Archive internship (set status = 'archived')
router.put('/:id/archive', hospitalController.archiveInternship);

// Get applications for an internship
router.get('/:id/applications', hospitalController.getInternshipApplications);

// Student apply to internship
router.post('/:id/apply', verifyToken, applicationsController.applyToInternship);

// Update application status (approve/reject)
router.post('/applications/:id/status', hospitalController.updateApplicationStatus);

module.exports = router;