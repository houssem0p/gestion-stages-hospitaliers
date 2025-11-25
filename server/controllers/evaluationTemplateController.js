const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Create a new evaluation template
const createTemplate = async (req, res) => {
  try {
    const { internship_id, template_name, description, created_by, criteria } = req.body;

    if (!internship_id) return res.status(400).json({ success: false, message: 'internship_id is required' });
    if (!template_name || String(template_name).trim() === '') return res.status(400).json({ success: false, message: 'template_name is required' });

    const [result] = await sequelize.query(
      `INSERT INTO evaluation_templates (internship_id, template_name, description, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      { replacements: [internship_id || null, template_name || null, description || null, created_by || null] }
    );

    const templateId = result && result.insertId ? result.insertId : null;

    if (templateId && Array.isArray(criteria) && criteria.length > 0) {
      for (const c of criteria) {
        await sequelize.query(
          `INSERT INTO evaluation_criteria (template_id, category, criteria_text, description, criteria_type, weight, max_score, sort_order, is_required, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          { replacements: [
            templateId,
            c.category || null,
            c.criteria_text || null,
            c.description || null,
            c.criteria_type || 'scale',
            typeof c.weight !== 'undefined' ? c.weight : 1.0,
            typeof c.max_score !== 'undefined' ? c.max_score : 5,
            typeof c.sort_order !== 'undefined' ? c.sort_order : 0,
            typeof c.is_required !== 'undefined' ? (c.is_required ? 1 : 0) : 1
          ] }
        );
      }
    }

    res.status(201).json({ success: true, message: 'Template created', templateId });
  } catch (error) {
    console.error('Error creating evaluation template', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const rows = await sequelize.query(`SELECT * FROM evaluation_templates ORDER BY created_at DESC`, { type: QueryTypes.SELECT });
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching evaluation templates', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

module.exports = { createTemplate, getTemplates };