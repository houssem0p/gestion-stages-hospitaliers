const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Assign teacher to internship
const assignTeacherToInternship = async (req, res) => {
  try {
    const { internship_id, teacher_id, student_id } = req.body;
    
    if (!internship_id || !teacher_id) {
      return res.status(400).json({ success: false, message: 'internship_id and teacher_id are required' });
    }

    // Get hospital_id from internship
    const [internship] = await sequelize.query(
      `SELECT o.id, o.hospital, 
       (SELECT hospital_id FROM internship_participants WHERE internship_id = o.id LIMIT 1) as hospital_id
       FROM offers o WHERE o.id = ?`,
      { replacements: [internship_id], type: QueryTypes.SELECT }
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    let hospitalId = internship.hospital_id;
    if (!hospitalId && internship.hospital) {
      const [hospital] = await sequelize.query(
        `SELECT id FROM hospitals WHERE name = ? LIMIT 1`,
        { replacements: [internship.hospital], type: QueryTypes.SELECT }
      );
      hospitalId = hospital?.id || null;
    }

    // Get student_id if not provided
    let finalStudentId = student_id;
    if (!finalStudentId) {
      const [student] = await sequelize.query(
        `SELECT student_id FROM internship_participants 
         WHERE internship_id = ? AND role = 'student' AND status = 'active' 
         LIMIT 1`,
        { replacements: [internship_id], type: QueryTypes.SELECT }
      );
      finalStudentId = student?.student_id || null;
    }

    // Create/update teacher participant entry
    await sequelize.query(
      `INSERT INTO internship_participants (internship_id, student_id, doctor_id, teacher_id, hospital_id, role, status, assigned_at)
       VALUES (?, ?, 
         (SELECT doctor_id FROM internship_participants WHERE internship_id = ? AND role = 'doctor' LIMIT 1),
         ?, ?, 'teacher', 'active', NOW())
       ON DUPLICATE KEY UPDATE teacher_id = ?, status = 'active'`,
      { replacements: [internship_id, finalStudentId, internship_id, teacher_id, hospitalId, teacher_id] }
    );

    // Update student participant entry to include teacher_id
    if (finalStudentId) {
      await sequelize.query(
        `UPDATE internship_participants 
         SET teacher_id = ?, status = 'active'
         WHERE internship_id = ? AND student_id = ? AND role = 'student'`,
        { replacements: [teacher_id, internship_id, finalStudentId] }
      );
    }

    res.json({ success: true, message: 'Teacher assigned successfully' });
  } catch (error) {
    console.error('Error assigning teacher to internship', error);
    res.status(500).json({ success: false, message: 'Failed to assign teacher' });
  }
};

// Get teacher's internships with students
const getTeacherInternships = async (req, res) => {
  try {
    const teacherId = req.user?.userId || req.user?.id;
    if (!teacherId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const internships = await sequelize.query(
      `SELECT DISTINCT
         ip.internship_id,
         o.id as offer_id,
         o.title,
         o.hospital,
         o.speciality,
         o.startDate,
         o.endDate,
         ip.student_id,
         u.first_name as student_first_name,
         u.last_name as student_last_name,
         u.email as student_email,
         sp.matricule,
         sp.speciality as student_speciality,
         sp.academic_year,
         ip.doctor_id,
         d.first_name as doctor_first_name,
         d.last_name as doctor_last_name
       FROM internship_participants ip
       JOIN offers o ON ip.internship_id = o.id
       LEFT JOIN users u ON ip.student_id = u.id
       LEFT JOIN student_profiles sp ON ip.student_id = sp.user_id
       LEFT JOIN users d ON ip.doctor_id = d.id
       WHERE ip.teacher_id = ? AND ip.status = 'active'
       ORDER BY o.created_at DESC`,
      { replacements: [teacherId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: internships || [] });
  } catch (error) {
    console.error('Error fetching teacher internships', error);
    res.status(500).json({ success: false, message: 'Failed to fetch internships' });
  }
};

module.exports = {
  assignTeacherToInternship,
  getTeacherInternships
};

