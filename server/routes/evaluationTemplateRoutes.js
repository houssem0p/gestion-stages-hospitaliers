const express = require('express');
const router = express.Router();
const evaluationTemplateController = require('../controllers/evaluationTemplateController');
const { verifyToken } = require('../middleware/authMiddleware');

// Create a new template (authenticated)
router.post('/', verifyToken, evaluationTemplateController.createTemplate);

// List templates (authenticated)
router.get('/', verifyToken, evaluationTemplateController.getTemplates);

module.exports = router;
