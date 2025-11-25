const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Upload student document (handled by multer in route)
const uploadDocument = async (req, res) => {
  try {
    // Token contains { userId, role } per authController.login
    const studentId = req.user?.userId || req.user?.id || req.body.student_id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { originalname, mimetype, size, path } = req.file;
    const document_type = req.body.document_type || 'other';

    await sequelize.query(
      `INSERT INTO student_documents (student_id, document_type, file_path, original_name, file_size, mime_type, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      { replacements: [studentId, document_type, path, originalname, size, mimetype] }
    );

    const inserted = await sequelize.query(`SELECT * FROM student_documents WHERE id = LAST_INSERT_ID()`, { type: QueryTypes.SELECT });

    res.status(201).json({ success: true, data: inserted[0] || null });
  } catch (error) {
    console.error('Error uploading student document', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

// Get student documents
const getStudentDocuments = async (req, res) => {
  try {
    // Support token payload shape: { userId, role }
    const studentId = req.user?.userId || req.user?.id || req.params.studentId || req.query.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'student id required' });

    const rows = await sequelize.query(
      `SELECT * FROM student_documents WHERE student_id = ? ORDER BY uploaded_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching student documents', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

// Get student profile by id
const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user?.userId || req.user?.id;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    // Select existing columns and provide compatibility aliases for frontend expectations
    const rows = await sequelize.query(
      `SELECT 
         id, 
         first_name, 
         last_name, 
         email, 
         phone,
         hospital_id,
         specialty AS speciality,
         NULL AS matricule,
         NULL AS year,
         profile_completed
       FROM users WHERE id = ? LIMIT 1`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching student profile', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile' });
  }
};

// Get internships related to a student (via applications)
const getStudentInternships = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user?.userId || req.user?.id;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    const rows = await sequelize.query(
      `SELECT o.*, a.status AS application_status, a.created_at AS applied_at,
              u.first_name AS doctor_first_name, u.last_name AS doctor_last_name, u.email AS doctor_email
       FROM applications a
       LEFT JOIN offers o ON a.internship_id = o.id
       LEFT JOIN users u ON o.doctor_id = u.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error('Error fetching student internships', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student internships' });
  }
};

module.exports = { uploadDocument, getStudentDocuments, getStudentProfile, getStudentInternships };
