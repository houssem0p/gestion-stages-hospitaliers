const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getDoctorInternships = async (req, res) => {
  try {
    const doctorId = req.user.userId; // From JWT token
    
    console.log('Fetching internships for doctor ID:', doctorId);

    // Get internships for this doctor
    const internships = await sequelize.query(
      `SELECT 
        o.id,
        o.title,
        o.description,
        o.start_date,
        o.end_date,
        o.speciality,
        h.name as hospital_name,
        COUNT(a.id) as applicant_count
       FROM offers o 
       LEFT JOIN hospitals h ON o.hospital_id = h.id
       LEFT JOIN applications a ON o.id = a.internship_id
       WHERE o.doctor_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      { replacements: [doctorId], type: QueryTypes.SELECT }
    );

    res.json({ 
      success: true, 
      data: internships 
    });

  } catch (error) {
    console.error('Error in getDoctorInternships:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

const getInternshipApplicants = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const internshipId = req.params.internshipId;

    console.log('Fetching applicants for internship:', internshipId);

    // Verify the internship belongs to this doctor
    const internship = await sequelize.query(
      `SELECT id FROM offers WHERE id = ? AND doctor_id = ?`,
      { replacements: [internshipId, doctorId], type: QueryTypes.SELECT }
    );

    if (internship.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this internship' 
      });
    }

    // Get applicants
    const applicants = await sequelize.query(
      `SELECT 
        a.id as application_id,
        a.student_id,
        a.status as application_status,
        a.application_text,
        a.created_at as applied_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
       FROM applications a
       INNER JOIN users u ON a.student_id = u.id
       WHERE a.internship_id = ?
       ORDER BY a.created_at DESC`,
      { replacements: [internshipId], type: QueryTypes.SELECT }
    );

    res.json({ 
      success: true, 
      data: applicants 
    });

  } catch (error) {
    console.error('Error in getInternshipApplicants:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  getDoctorInternships,
  getInternshipApplicants
};

