const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Apply to an internship (student)
const applyToInternship = async (req, res) => {
  try {
    const internshipIdRaw = req.params.id;
    // Token payload uses { userId, role }
    const studentIdRaw = req.user?.userId || req.user?.id || req.body.student_id; // prefer authenticated user

    const internshipId = internshipIdRaw ? parseInt(internshipIdRaw, 10) : null;
    const studentId = studentIdRaw ? parseInt(studentIdRaw, 10) : null;
    const { cover_letter } = req.body;

    if (!internshipId) return res.status(400).json({ success: false, message: 'internship id required' });
    if (!studentId) return res.status(401).json({ success: false, message: 'student authentication required' });

    // Check student documents - require at least one CV and transcripts
    const docs = await sequelize.query(
      `SELECT document_type FROM student_documents WHERE student_id = ?`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    const types = docs.map(d => d.document_type);
    if (!types.includes('cv') || !types.includes('transcripts')) {
      return res.status(400).json({ success: false, message: 'Please upload required documents (cv and transcripts) before applying' });
    }

    // Check duplicate application
    const existing = await sequelize.query(
      `SELECT * FROM applications WHERE internship_id = ? AND student_id = ? LIMIT 1`,
      { replacements: [internshipId, studentId], type: QueryTypes.SELECT }
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied to this internship' });
    }

    // Ensure the applications table has a cover_letter column (some schemas may be older)
    try {
      const cols = await sequelize.query(
        "SHOW COLUMNS FROM `applications` LIKE 'cover_letter'",
        { type: QueryTypes.SELECT }
      );
      if (!cols || cols.length === 0) {
        console.warn('applications table missing cover_letter column — adding it');
        await sequelize.query(
          `ALTER TABLE applications ADD COLUMN cover_letter TEXT NULL`,
          { raw: true }
        );
      }
    } catch (schemaErr) {
      console.error('Failed to ensure cover_letter column exists on applications table:', schemaErr?.message || schemaErr);
    }

    await sequelize.query(
      `INSERT INTO applications (internship_id, student_id, cover_letter, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
      { replacements: [internshipId, studentId, cover_letter || null] }
    );

    const inserted = await sequelize.query(`SELECT * FROM applications WHERE id = LAST_INSERT_ID()`, { type: QueryTypes.SELECT });

    // TODO: notify hospital/admin (email or internal notification) - left as future enhancement

    res.status(201).json({ success: true, message: 'Application submitted', data: inserted[0] || null });
  } catch (error) {
    // Detailed logging for debugging
    console.error('Error applying to internship:', error?.message || error, error?.stack || 'no-stack');
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ success: false, message: 'Failed to apply', error: error?.message || String(error) });
    }
    res.status(500).json({ success: false, message: 'Failed to apply' });
  }
};

// Get applications for a student
const getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user?.userId || req.user?.id || req.params.studentId || req.query.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'student id required' });

    const rows = await sequelize.query(
      `SELECT a.*, o.title as internship_title, o.hospital as hospital_name
       FROM applications a
       LEFT JOIN offers o ON o.id = a.internship_id
       WHERE a.student_id = ? ORDER BY a.created_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching student applications', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

module.exports = { applyToInternship, getStudentApplications };