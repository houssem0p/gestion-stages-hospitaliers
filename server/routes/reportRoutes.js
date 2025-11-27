const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Submit a report (student)
router.post('/', reportsController.submitReport);

// Get reports for a student
router.get('/student/:studentId', reportsController.getReportsByStudent);

// Get report by id
router.get('/:id', reportsController.getReportById);

module.exports = router;
