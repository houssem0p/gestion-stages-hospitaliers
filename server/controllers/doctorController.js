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

const getDoctorInternships = async (req, res) => {
  try {
    const doctorId = req.user.userId; // From JWT token
    
    console.log('Fetching internships for doctor ID:', doctorId);

    // Check which columns exist
    const hasHospitalCol = await columnExists('offers', 'hospital');
    const hasHospitalIdCol = await columnExists('offers', 'hospital_id');

    // Build the hospital name selection based on available columns
    let hospitalSelect = 'NULL as hospital_name';
    let hospitalJoin = '';
    
    if (hasHospitalIdCol) {
      hospitalSelect = 'h.name as hospital_name';
      hospitalJoin = 'LEFT JOIN hospitals h ON o.hospital_id = h.id';
    } else if (hasHospitalCol) {
      hospitalSelect = 'o.hospital as hospital_name';
    }

    // Get internships for this doctor
    const internships = await sequelize.query(
      `SELECT 
        o.id,
        o.title,
        o.description,
        o.startDate as start_date,
        o.endDate as end_date,
        o.speciality,
        ${hospitalSelect},
        COUNT(a.id) as applicant_count
       FROM offers o 
       ${hospitalJoin}
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

// Get doctor's trainees (students assigned to doctor's internships)
const getMyTrainees = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    if (!doctorId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const trainees = await sequelize.query(
      `SELECT DISTINCT
         ip.student_id,
         u.id,
         u.first_name,
         u.last_name,
         u.email,
         sp.matricule,
         sp.speciality as student_speciality,
         sp.academic_year,
         ip.internship_id,
         o.title as internship_title,
         o.hospital,
         o.speciality,
         o.startDate,
         o.endDate,
         ip.status,
         ip.assigned_at
       FROM internship_participants ip
       JOIN offers o ON ip.internship_id = o.id
       LEFT JOIN users u ON ip.student_id = u.id
       LEFT JOIN student_profiles sp ON ip.student_id = sp.user_id
       WHERE (ip.doctor_id = ? OR o.doctor_id = ?) 
         AND ip.student_id IS NOT NULL 
         AND ip.status = 'active'
       ORDER BY ip.assigned_at DESC`,
      { replacements: [doctorId, doctorId], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: trainees || [] });
  } catch (error) {
    console.error('Error fetching doctor trainees', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trainees' });
  }
};

module.exports = {
  getDoctorInternships,
  getInternshipApplicants,
  getMyTrainees
};

