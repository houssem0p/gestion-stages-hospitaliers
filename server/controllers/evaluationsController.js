const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Helper to check if a column exists in a table
const columnExists = async (table, column) => {
  try {
    const rows = await sequelize.query(
      `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
      { replacements: [column], type: QueryTypes.SELECT }
    );
    return rows && rows.length > 0;
  } catch (err) {
    console.warn('columnExists check failed for', table, column, err.message);
    return false;
  }
};

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

// Create or update evaluation (uses evaluation_scores table)
const upsertEvaluation = async (req, res) => {
  try {
    const { internship_id, student_id, doctor_id, template_id, scores, comments, final_grade } = req.body;
    const evaluationIdFromUrl = req.params.evaluationId;
    
    if (!internship_id || !student_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'internship_id and student_id required' 
      });
    }

    if (!template_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'template_id is required' 
      });
    }

    let evaluationId;
    let existing = null;

    // If evaluationId is in URL (PUT request), use it
    if (evaluationIdFromUrl) {
      existing = await sequelize.query(
        `SELECT * FROM evaluations WHERE id = ? LIMIT 1`,
        { replacements: [evaluationIdFromUrl], type: QueryTypes.SELECT }
      );
      if (existing && existing.length > 0) {
        evaluationId = parseInt(evaluationIdFromUrl);
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'Evaluation not found' 
        });
      }
    } else {
      // Check if evaluation exists by internship and student
      existing = await sequelize.query(
        `SELECT * FROM evaluations WHERE internship_id = ? AND student_id = ? LIMIT 1`,
        { replacements: [internship_id, student_id], type: QueryTypes.SELECT }
      );
      if (existing && existing.length > 0) {
        evaluationId = existing[0].id;
      }
    }

    // Check if columns exist and add them if missing
    let hasCommentsCol = await columnExists('evaluations', 'comments');
    let hasTemplateIdCol = await columnExists('evaluations', 'template_id');
    let hasFinalGradeCol = await columnExists('evaluations', 'final_grade');
    
    // Add missing columns if they don't exist
    if (!hasCommentsCol) {
      try {
        await sequelize.query(
          `ALTER TABLE evaluations ADD COLUMN comments TEXT`,
          { type: QueryTypes.RAW }
        );
        hasCommentsCol = true;
        console.log('Added comments column to evaluations table');
      } catch (err) {
        console.warn('Failed to add comments column:', err.message);
      }
    }
    
    if (!hasTemplateIdCol) {
      try {
        await sequelize.query(
          `ALTER TABLE evaluations ADD COLUMN template_id INT`,
          { type: QueryTypes.RAW }
        );
        hasTemplateIdCol = true;
        console.log('Added template_id column to evaluations table');
      } catch (err) {
        console.warn('Failed to add template_id column:', err.message);
      }
    }
    
    if (!hasFinalGradeCol) {
      try {
        await sequelize.query(
          `ALTER TABLE evaluations ADD COLUMN final_grade VARCHAR(50)`,
          { type: QueryTypes.RAW }
        );
        hasFinalGradeCol = true;
        console.log('Added final_grade column to evaluations table');
      } catch (err) {
        console.warn('Failed to add final_grade column:', err.message);
      }
    }

    if (existing && existing.length > 0 && evaluationId) {
      // Update existing evaluation
      evaluationId = existing[0].id;
      
      // Build update query dynamically
      const updateFields = ['doctor_id = ?'];
      const updateValues = [doctor_id || null];
      
      if (hasTemplateIdCol) {
        updateFields.push('template_id = ?');
        updateValues.push(template_id);
      }
      
      if (hasCommentsCol) {
        updateFields.push('comments = ?');
        updateValues.push(comments || null);
      }
      
      if (hasFinalGradeCol) {
        updateFields.push('final_grade = ?');
        updateValues.push(final_grade || null);
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(evaluationId);
      
      await sequelize.query(
        `UPDATE evaluations SET ${updateFields.join(', ')} WHERE id = ?`,
        { replacements: updateValues }
      );
    } else {
      // Create new evaluation
      const insertFields = ['internship_id', 'student_id', 'doctor_id'];
      const insertValues = [internship_id, student_id, doctor_id || null];
      
      if (hasTemplateIdCol) {
        insertFields.push('template_id');
        insertValues.push(template_id);
      }
      
      if (hasCommentsCol) {
        insertFields.push('comments');
        insertValues.push(comments || null);
      }
      
      if (hasFinalGradeCol) {
        insertFields.push('final_grade');
        insertValues.push(final_grade || null);
      }
      
      insertFields.push('created_at', 'updated_at');
      
      // Build placeholders - use NOW() for timestamps, ? for others
      const placeholders = insertFields.map(field => {
        if (field === 'created_at' || field === 'updated_at') {
          return 'NOW()';
        }
        return '?';
      }).join(', ');
      
      await sequelize.query(
        `INSERT INTO evaluations (${insertFields.join(', ')}) VALUES (${placeholders})`,
        { replacements: insertValues }
      );
      
      // Get the inserted ID
      const inserted = await sequelize.query(
        `SELECT LAST_INSERT_ID() as id`,
        { type: QueryTypes.SELECT }
      );
      evaluationId = inserted[0]?.id;
    }

    // Handle scores - scores should be an object with criteria_id as keys
    // Format: { criteria_id: { score: number, text_response: string } }
    if (scores && typeof scores === 'object') {
      // Delete existing scores for this evaluation
      await sequelize.query(
        `DELETE FROM evaluation_scores WHERE evaluation_id = ?`,
        { replacements: [evaluationId] }
      );

      // Insert new scores
      for (const [criteriaId, scoreData] of Object.entries(scores)) {
        const scoreValue = typeof scoreData === 'object' ? scoreData.score : scoreData;
        const textResponse = typeof scoreData === 'object' ? scoreData.text_response : null;
        const scoreComments = typeof scoreData === 'object' ? scoreData.comments : null;

        // Only insert if there's a value
        if (scoreValue !== null && scoreValue !== undefined && scoreValue !== '') {
          await sequelize.query(
            `INSERT INTO evaluation_scores 
             (evaluation_id, criteria_id, score, text_response, comments, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            { 
              replacements: [
                evaluationId, 
                parseInt(criteriaId), 
                parseFloat(scoreValue) || null, 
                textResponse || null, 
                scoreComments || null
              ] 
            }
          );
        }
      }
    }

    // Get the complete evaluation with scores
    const evaluation = await getEvaluationWithScores(evaluationId);

    res.json({ 
      success: true, 
      message: existing && existing.length > 0 ? 'Evaluation updated' : 'Evaluation created',
      data: evaluation 
    });

  } catch (error) {
    console.error('Error upserting evaluation', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save evaluation: ' + error.message 
    });
  }
};

// Helper function to get evaluation with scores from evaluation_scores table
const getEvaluationWithScores = async (evaluationId) => {
  const evaluation = await sequelize.query(
    `SELECT * FROM evaluations WHERE id = ? LIMIT 1`,
    { replacements: [evaluationId], type: QueryTypes.SELECT }
  );

  if (!evaluation || evaluation.length === 0) {
    return null;
  }

  // Get scores from evaluation_scores table
  const scores = await sequelize.query(
    `SELECT 
       es.*,
       ec.category,
       ec.criteria_text,
       ec.description AS criteria_description,
       ec.criteria_type,
       ec.weight,
       ec.max_score,
       ec.is_required
     FROM evaluation_scores es
     JOIN evaluation_criteria ec ON es.criteria_id = ec.id
     WHERE es.evaluation_id = ?
     ORDER BY ec.sort_order`,
    { replacements: [evaluationId], type: QueryTypes.SELECT }
  );

  return {
    ...evaluation[0],
    scores: scores || []
  };
};

// Get evaluation template for an internship
const getEvaluationTemplate = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    
    // First, check if template exists
    const templateCheck = await sequelize.query(
      `SELECT * FROM evaluation_templates 
       WHERE internship_id = ? AND is_active = true 
       LIMIT 1`,
      { replacements: [internshipId], type: QueryTypes.SELECT }
    );

    if (!templateCheck || templateCheck.length === 0) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No evaluation template found for this internship' 
      });
    }

    const templateInfo = templateCheck[0];

    // Get criteria for this template (using LEFT JOIN to handle templates without criteria)
    const criteria = await sequelize.query(
      `SELECT 
         ec.id AS criteria_id,
         ec.category,
         ec.criteria_text,
         ec.description AS criteria_description,
         ec.criteria_type,
         ec.weight,
         ec.max_score,
         ec.sort_order,
         ec.is_required
       FROM evaluation_criteria ec
       WHERE ec.template_id = ?
       ORDER BY ec.sort_order`,
      { replacements: [templateInfo.id], type: QueryTypes.SELECT }
    );

    // Build template data structure
    const templateData = {
      id: templateInfo.id,
      internship_id: templateInfo.internship_id,
      template_name: templateInfo.template_name,
      description: templateInfo.description,
      criteria: criteria.map(row => ({
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

// Get evaluation(s) with scores from evaluation_scores table
const getEvaluation = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    const studentId = req.query.studentId;
    if (!internshipId) return res.status(400).json({ success: false, message: 'internshipId required' });
    
    let evaluations;
    if (studentId) {
      evaluations = await sequelize.query(
        `SELECT * FROM evaluations WHERE internship_id = ? AND student_id = ? LIMIT 1`, 
        { replacements: [internshipId, studentId], type: QueryTypes.SELECT }
      );
    } else {
      evaluations = await sequelize.query(
        `SELECT * FROM evaluations WHERE internship_id = ? ORDER BY created_at DESC`, 
        { replacements: [internshipId], type: QueryTypes.SELECT }
      );
    }

    // Get scores for each evaluation
    const evaluationsWithScores = await Promise.all(
      evaluations.map(async (eval) => {
        const scores = await sequelize.query(
          `SELECT 
             es.*,
             ec.category,
             ec.criteria_text,
             ec.description AS criteria_description,
             ec.criteria_type,
             ec.weight,
             ec.max_score,
             ec.is_required,
             ec.sort_order
           FROM evaluation_scores es
           JOIN evaluation_criteria ec ON es.criteria_id = ec.id
           WHERE es.evaluation_id = ?
           ORDER BY ec.sort_order`,
          { replacements: [eval.id], type: QueryTypes.SELECT }
        );

        return {
          ...eval,
          scores: scores || []
        };
      })
    );
    
    res.json({ success: true, data: studentId ? (evaluationsWithScores[0] || null) : evaluationsWithScores });
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
  getAttestationData,
  getEvaluationWithScores
};