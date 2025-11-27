const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Student submits a report
const submitReport = async (req, res) => {
  try {
    const { internship_id, student_id, title, content, file_url, status } = req.body;
    if (!internship_id || !student_id || !title) return res.status(400).json({ success:false, message:'internship_id, student_id and title required' });

    const result = await sequelize.query(
      `INSERT INTO reports (internship_id, student_id, title, content, file_url, status, submission_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      { replacements: [internship_id, student_id, title, content || null, file_url || null, status || 'submitted', status === 'submitted' ? new Date() : null] }
    );

    const inserted = await sequelize.query(`SELECT * FROM reports WHERE id = LAST_INSERT_ID()`, { type: QueryTypes.SELECT });
    res.status(201).json({ success:true, data: inserted[0] || null });
  } catch (error) {
    console.error('Error submitting report', error);
    res.status(500).json({ success:false, message:'Failed to submit report' });
  }
};

// Get reports for a student
const getReportsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ success:false, message:'studentId required' });
    const rows = await sequelize.query(
      `SELECT r.*, o.title AS internship_title, o.hospital AS hospital_name
       FROM reports r
       LEFT JOIN offers o ON o.id = r.internship_id
       WHERE r.student_id = ? ORDER BY r.created_at DESC`,
      { replacements: [studentId], type: QueryTypes.SELECT }
    );
    res.json({ success:true, data: rows });
  } catch (error) {
    console.error('Error fetching reports for student', error);
    // Return an empty array to avoid breaking the frontend; log error for debugging
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({ success:true, data: [], _warning: 'Error: ' + (error?.message || String(error)) });
    }
    res.status(200).json({ success:true, data: [] });
  }
};

// Get single report by id
const getReportById = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await sequelize.query(`SELECT * FROM reports WHERE id = ? LIMIT 1`, { replacements: [id], type: QueryTypes.SELECT });
    if (!rows || rows.length === 0) return res.status(404).json({ success:false, message:'Report not found' });
    res.json({ success:true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching report', error);
    res.status(500).json({ success:false, message:'Failed to fetch report' });
  }
};

module.exports = { submitReport, getReportsByStudent, getReportById };
