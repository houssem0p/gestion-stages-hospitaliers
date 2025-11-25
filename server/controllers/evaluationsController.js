const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Get evaluations for a student with detailed scores
const getEvaluationsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });
    
    console.log(`Fetching evaluations for student ${studentId}`);

    // Get evaluations with basic info
    const evaluations = await sequelize.query(
      `SELECT 
         e.*,
         o.title AS internship_title,
         o.hospital AS hospital_name,
         o.doctor_id,
         u.first_name AS doctor_first_name,
         u.last_name AS doctor_last_name,
         et.template_name
       FROM evaluations e
       LEFT JOIN offers o ON e.internship_id = o.id
       LEFT JOIN users u ON o.doctor_id = u.id
       LEFT JOIN evaluation_templates et ON e.template_id = et.id
       WHERE e.student_id = ?
       ORDER BY e.created_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    console.log(`Found ${evaluations.length} evaluations for student ${studentId}`);

    // Get detailed scores for each evaluation
    const evaluationsWithScores = await Promise.all(
      evaluations.map(async (evaluation) => {
        let scores = [];
        
        // Try to get detailed scores from evaluation_scores table first
        try {
          scores = await sequelize.query(
            `SELECT 
               es.*,
               ec.category,
               ec.criteria_text,
               ec.description AS criteria_description,
               ec.criteria_type,
               ec.max_score
             FROM evaluation_scores es
             JOIN evaluation_criteria ec ON es.criteria_id = ec.id
             WHERE es.evaluation_id = ?
             ORDER BY ec.sort_order`,
            { replacements: [evaluation.id], type: QueryTypes.SELECT }
          );
        } catch (error) {
          console.log('No detailed scores found, using JSON scores');
        }

        // If no detailed scores, try to parse JSON scores
        if (scores.length === 0 && evaluation.scores) {
          try {
            const jsonScores = typeof evaluation.scores === 'string' 
              ? JSON.parse(evaluation.scores) 
              : evaluation.scores;
            
            // Convert JSON scores to detailed format
            scores = Object.entries(jsonScores).flatMap(([category, categoryScores]) => 
              Object.entries(categoryScores).map(([criteria, score]) => ({
                category,
                criteria_text: criteria,
                score: score,
                criteria_type: 'scale',
                max_score: 5
              }))
            );
          } catch (parseError) {
            console.error('Error parsing JSON scores:', parseError);
          }
        }

        return {
          ...evaluation,
          scores: scores,
          has_detailed_scores: scores.length > 0
        };
      })
    );

    res.json({ 
      success: true, 
      data: evaluationsWithScores,
      count: evaluationsWithScores.length 
    });
  } catch (error) {
    console.error('Error fetching evaluations for student', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch evaluations: ' + error.message 
    });
  }
};

// Create or update evaluation (supports both JSON and detailed scores)
const upsertEvaluation = async (req, res) => {
  try {
    const { internship_id, student_id, doctor_id, template_id, scores, detailed_scores, comments, final_grade } = req.body;
    
    if (!internship_id || !student_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'internship_id and student_id required' 
      });
    }

    // Check if evaluation exists
    const existing = await sequelize.query(
      `SELECT * FROM evaluations WHERE internship_id = ? AND student_id = ? LIMIT 1`,
      { replacements: [internship_id, student_id], type: QueryTypes.SELECT }
    );

    let evaluationId;

    if (existing && existing.length > 0) {
      // Update existing evaluation
      evaluationId = existing[0].id;
      await sequelize.query(
        `UPDATE evaluations SET 
          doctor_id = ?, 
          template_id = ?,
          scores = ?,
          comments = ?, 
          final_grade = ?, 
          updated_at = NOW() 
         WHERE id = ?`,
        { 
          replacements: [
            doctor_id || null, 
            template_id || null,
            scores ? JSON.stringify(scores) : null,
            comments || null, 
            final_grade || null, 
            evaluationId
          ] 
        }
      );
    } else {
      // Create new evaluation
      const result = await sequelize.query(
        `INSERT INTO evaluations 
         (internship_id, student_id, doctor_id, template_id, scores, comments, final_grade, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { 
          replacements: [
            internship_id, 
            student_id, 
            doctor_id || null, 
            template_id || null,
            scores ? JSON.stringify(scores) : null,
            comments || null, 
            final_grade || null
          ] 
        }
      );
      evaluationId = result[0];
    }

    // Handle detailed scores if provided
    if (detailed_scores && Array.isArray(detailed_scores)) {
      for (const score of detailed_scores) {
        const { criteria_id, score_value, text_response, comments } = score;

        // Check if score exists
        const existingScore = await sequelize.query(
          `SELECT * FROM evaluation_scores WHERE evaluation_id = ? AND criteria_id = ? LIMIT 1`,
          { replacements: [evaluationId, criteria_id], type: QueryTypes.SELECT }
        );

        if (existingScore && existingScore.length > 0) {
          // Update existing score
          await sequelize.query(
            `UPDATE evaluation_scores SET score = ?, text_response = ?, comments = ?, updated_at = NOW() WHERE id = ?`,
            { 
              replacements: [
                score_value || null, 
                text_response || null, 
                comments || null, 
                existingScore[0].id
              ] 
            }
          );
        } else {
          // Insert new score
          await sequelize.query(
            `INSERT INTO evaluation_scores 
             (evaluation_id, criteria_id, score, text_response, comments, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            { 
              replacements: [
                evaluationId, 
                criteria_id, 
                score_value || null, 
                text_response || null, 
                comments || null
              ] 
            }
          );
        }
      }
    }

    // Get the complete evaluation
    const evaluation = await sequelize.query(
      `SELECT * FROM evaluations WHERE id = ?`,
      { replacements: [evaluationId], type: QueryTypes.SELECT }
    );

    res.json({ 
      success: true, 
      message: existing && existing.length > 0 ? 'Evaluation updated' : 'Evaluation created',
      data: evaluation[0] || null 
    });

  } catch (error) {
    console.error('Error upserting evaluation', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save evaluation: ' + error.message 
    });
  }
};

// Get evaluation template for an internship
const getEvaluationTemplate = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    
    const template = await sequelize.query(
      `SELECT 
         et.*,
         ec.id AS criteria_id,
         ec.category,
         ec.criteria_text,
         ec.description AS criteria_description,
         ec.criteria_type,
         ec.weight,
         ec.max_score,
         ec.sort_order,
         ec.is_required
       FROM evaluation_templates et
       JOIN evaluation_criteria ec ON et.id = ec.template_id
       WHERE et.internship_id = ? AND et.is_active = true
       ORDER BY ec.sort_order`,
      { replacements: [internshipId], type: QueryTypes.SELECT }
    );

    if (!template || template.length === 0) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No evaluation template found for this internship' 
      });
    }

    // Group criteria by template
    const templateData = {
      id: template[0].id,
      internship_id: template[0].internship_id,
      template_name: template[0].template_name,
      description: template[0].description,
      criteria: template.map(row => ({
        id: row.criteria_id,
        category: row.category,
        criteria_text: row.criteria_text,
        description: row.criteria_description,
        criteria_type: row.criteria_type,
        weight: row.weight,
        max_score: row.max_score,
        sort_order: row.sort_order,
        is_required: row.is_required
      }))
    };

    res.json({ success: true, data: templateData });
  } catch (error) {
    console.error('Error fetching evaluation template', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch evaluation template' 
    });
  }
};

// Create evaluation template
const createTemplate = async (req, res) => {
  try {
    const { internship_id, template_name, description, created_by, criteria } = req.body;

    if (!internship_id || !template_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'internship_id and template_name are required' 
      });
    }

    // Insert template
    await sequelize.query(
      `INSERT INTO evaluation_templates (internship_id, template_name, description, created_by) VALUES (?, ?, ?, ?)`,
      { replacements: [internship_id, template_name, description || null, created_by || null] }
    );

    const templateId = await sequelize.query(
      `SELECT LAST_INSERT_ID() as id`,
      { type: QueryTypes.SELECT }
    );

    const templateIdValue = templateId[0].id;

    // Insert criteria
    if (criteria && Array.isArray(criteria)) {
      for (const c of criteria) {
        await sequelize.query(
          `INSERT INTO evaluation_criteria 
           (template_id, category, criteria_text, description, criteria_type, weight, max_score, sort_order, is_required) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          { 
            replacements: [
              templateIdValue,
              c.category || 'General',
              c.criteria_text,
              c.description || null,
              c.criteria_type || 'scale',
              c.weight || 1.0,
              c.max_score || 5,
              c.sort_order || 0,
              c.is_required !== undefined ? c.is_required : true
            ] 
          }
        );
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Template created successfully',
      data: { id: templateIdValue } 
    });
  } catch (error) {
    console.error('Error creating template', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create template: ' + error.message 
    });
  }
};

// Get all templates
const getTemplates = async (req, res) => {
  try {
    const templates = await sequelize.query(
      `SELECT 
         et.*,
         o.title AS internship_title,
         o.hospital AS hospital_name
       FROM evaluation_templates et
       LEFT JOIN offers o ON et.internship_id = o.id
       ORDER BY et.created_at DESC`,
      { type: QueryTypes.SELECT }
    );
    
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching templates', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch templates' 
    });
  }
};

// Other existing functions remain the same...
const getEvaluation = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    const studentId = req.query.studentId;
    if (!internshipId) return res.status(400).json({ success: false, message: 'internshipId required' });
    
    let rows;
    if (studentId) {
      rows = await sequelize.query(
        `SELECT * FROM evaluations WHERE internship_id = ? AND student_id = ? LIMIT 1`, 
        { replacements: [internshipId, studentId], type: QueryTypes.SELECT }
      );
    } else {
      rows = await sequelize.query(
        `SELECT * FROM evaluations WHERE internship_id = ? ORDER BY created_at DESC`, 
        { replacements: [internshipId], type: QueryTypes.SELECT }
      );
    }
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching evaluation', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluation' });
  }
};

const getAttestationData = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    const studentId = req.params.studentId;
    if (!internshipId || !studentId) return res.status(400).json({ success: false, message: 'internshipId and studentId required' });

    const rows = await sequelize.query(
      `SELECT o.title AS internship_title, o.hospital AS hospital_name, u.first_name, u.last_name, u.email
       FROM offers o
       LEFT JOIN users u ON u.id = ?
       WHERE o.id = ? LIMIT 1`,
      { replacements: [studentId, internshipId], type: QueryTypes.SELECT }
    );
    
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    console.error('Error fetching attestation data', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attestation data' });
  }
};

module.exports = {
  getEvaluationsByStudent,
  upsertEvaluation,
  getEvaluationTemplate,
  createTemplate,
  getTemplates,
  getEvaluation,
  getAttestationData
};