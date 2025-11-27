const express = require('express');
const router = express.Router();
const evaluationTemplateController = require('../controllers/evaluationTemplateController');

// Create a new template
router.post('/', evaluationTemplateController.createTemplate);

// List templates
router.get('/', evaluationTemplateController.getTemplates);

module.exports = router;
