const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { verifyToken } = require('../middleware/authMiddleware');
const applicationsController = require('../controllers/applicationsController');

// List all internships (public) - for students
router.get('/', hospitalController.listAllInternships);

// Get single internship by id
router.get('/:id', hospitalController.getInternshipById);

// Update internship (authenticated)
router.put('/:id', verifyToken, hospitalController.updateInternship);

// Archive internship (set status = 'archived') (authenticated)
router.put('/:id/archive', verifyToken, hospitalController.archiveInternship);

// Get applications for an internship (authenticated)
router.get('/:id/applications', verifyToken, hospitalController.getInternshipApplications);

// Student apply to internship (authenticated)
router.post('/:id/apply', verifyToken, applicationsController.applyToInternship);

// Update application status (approve/reject) (authenticated)
router.post('/applications/:id/status', verifyToken, hospitalController.updateApplicationStatus);

module.exports = router;