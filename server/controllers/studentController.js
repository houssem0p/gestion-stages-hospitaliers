const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');

// Helper function to normalize file paths (convert absolute to relative if needed)
const normalizeFilePath = (filePath) => {
  if (!filePath) return null;
  
  // If already a relative path starting with /uploads, return as is
  if (filePath.startsWith('/uploads/')) {
    return filePath;
  }
  
  // Extract just the uploads part from any path
  // This handles both absolute paths and paths with extra directory segments
  const uploadsIndex = filePath.indexOf('uploads');
  if (uploadsIndex !== -1) {
    // Extract everything from 'uploads' onwards and normalize
    let relativePath = filePath.substring(uploadsIndex).replace(/\\/g, '/');
    // Ensure it starts with /
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    return relativePath;
  }
  
  // If no 'uploads' found, try to convert absolute path to relative
  const serverDir = path.join(__dirname, '..');
  try {
    let relativePath = path.relative(serverDir, filePath).replace(/\\/g, '/');
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    return relativePath;
  } catch (err) {
    console.error('Error normalizing file path:', filePath, err);
    return null;
  }
};

// Upload student document (handled by multer in route)
const uploadDocument = async (req, res) => {
  try {
    // Token contains { userId, role } per authController.login
    const studentId = req.user?.userId || req.user?.id || req.body.student_id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { originalname, mimetype, size, path: filePath } = req.file;
    const document_type = req.body.document_type || 'other';

    // Convert absolute path to relative path for URL access
    // e.g., D:\GP\...\server\uploads\student_documents\file.pdf -> /uploads/student_documents/file.pdf
    const relativePath = normalizeFilePath(filePath);

    await sequelize.query(
      `INSERT INTO student_documents (student_id, document_type, file_path, original_name, file_size, mime_type, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      { replacements: [studentId, document_type, relativePath, originalname, size, mimetype] }
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

    // Normalize file paths for all documents
    const normalizedRows = rows.map(doc => ({
      ...doc,
      file_path: normalizeFilePath(doc.file_path)
    }));

    res.json({ success: true, data: normalizedRows });
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

    // Join student_profiles with users table to get complete profile
    const rows = await sequelize.query(
      `SELECT 
         sp.id,
         sp.user_id,
         sp.first_name, 
         sp.last_name, 
         u.email, 
         u.phone,
         sp.matricule,
         sp.speciality,
         sp.academic_year,
         sp.created_at,
         sp.updated_at
       FROM student_profiles sp
       LEFT JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ? LIMIT 1`,
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

// Save or update student profile
const saveStudentProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { first_name, last_name, matricule, speciality, academic_year } = req.body;

    // Check if profile exists
    const existing = await sequelize.query(
      `SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    let result;
    if (existing && existing.length > 0) {
      // Update existing profile
      await sequelize.query(
        `UPDATE student_profiles SET first_name = ?, last_name = ?, matricule = ?, speciality = ?, academic_year = ?, updated_at = NOW() WHERE user_id = ?`,
        { replacements: [first_name, last_name, matricule, speciality, academic_year, userId] }
      );
      const updated = await sequelize.query(
        `SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1`,
        { replacements: [userId], type: QueryTypes.SELECT }
      );
      result = updated[0];
    } else {
      // Create new profile
      await sequelize.query(
        `INSERT INTO student_profiles (user_id, first_name, last_name, matricule, speciality, academic_year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [userId, first_name, last_name, matricule, speciality, academic_year] }
      );
      const inserted = await sequelize.query(
        `SELECT * FROM student_profiles WHERE id = LAST_INSERT_ID() LIMIT 1`,
        { type: QueryTypes.SELECT }
      );
      result = inserted[0];
    }

    res.json({ success: true, data: result, message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving student profile', error);
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
};

// Get student profile from student_profiles table
const getStudentProfileData = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const rows = await sequelize.query(
      `SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching student profile data', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student profile data' });
  }
};

// Get student documents by student_id (for hospitals/admins to view candidate documents)
const getStudentDocumentsByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    // Check if user is hospital admin or has permission to view documents
    const userRole = req.user?.role;
    const allowedRoles = ['hospital_admin', 'super_admin', 'doctor', 'teacher'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Only hospital admins, doctors, teachers, and super admins can view student documents.' });
    }

    const rows = await sequelize.query(
      `SELECT * FROM student_documents WHERE student_id = ? ORDER BY uploaded_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );

    // Normalize file paths for all documents
    const normalizedRows = (rows || []).map(doc => ({
      ...doc,
      file_path: normalizeFilePath(doc.file_path)
    }));

    res.json({ success: true, data: normalizedRows });
  } catch (error) {
    console.error('Error fetching student documents by student_id', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student documents' });
  }
};

module.exports = { uploadDocument, getStudentDocuments, getStudentProfile, getStudentInternships, saveStudentProfile, getStudentProfileData, getStudentDocumentsByStudentId };
