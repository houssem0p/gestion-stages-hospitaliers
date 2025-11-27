// routes/evaluations.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const evaluationsController = require('../controllers/evaluationsController');

// Get evaluations for a student
router.get('/student/:studentId', evaluationsController.getEvaluationsByStudent);

// Get evaluation for internship
router.get('/internship/:internshipId', evaluationsController.getEvaluation);

// Get internships with evaluations and reports for teacher
router.get('/teacher/internships', verifyToken, evaluationsController.getTeacherInternships);

// Get evaluation template
router.get('/template/:internshipId', evaluationsController.getEvaluationTemplate);

// Get attestation data
router.get('/attestation/:internshipId/student/:studentId', evaluationsController.getAttestationData);

// Create/update evaluation
router.post('/', evaluationsController.upsertEvaluation);
router.put('/:evaluationId', evaluationsController.upsertEvaluation);

// Create template
router.post('/templates', evaluationsController.createTemplate);

// Get all templates
router.get('/templates', evaluationsController.getTemplates);

module.exports = router;