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

// Get list of hospitals
const getHospitals = async (req, res) => {
  try {
    const hospitals = await sequelize.query(
      `SELECT id, name, address, type, wilaya, capacity, created_at, updated_at 
       FROM hospitals 
       ORDER BY name`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: hospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals' });
  }
};

// Get internships for a given hospital
const getHospitalInternships = async (req, res) => {
  const hospitalId = req.params.id;
  try {
    // Get hospital name first, then filter offers by that hospital name
    const hospital = await sequelize.query(
      `SELECT name FROM hospitals WHERE id = ?`,
      { replacements: [hospitalId], type: QueryTypes.SELECT }
    );

    if (!hospital || hospital.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospitalName = hospital[0].name;

    // Build query dynamically depending on which columns exist in `offers`
    const hasHospitalCol = await columnExists('offers', 'hospital');
    const hasHospitalIdCol = await columnExists('offers', 'hospital_id');
    const hasStatusCol = await columnExists('offers', 'status');

    let whereClauses = [];
    let replacements = [];

    if (hasHospitalCol) {
      whereClauses.push(`hospital = ?`);
      replacements.push(hospitalName);
    } else if (hasHospitalIdCol) {
      whereClauses.push(`hospital_id = ?`);
      replacements.push(hospitalId);
    }

    if (hasStatusCol) {
      whereClauses.push(`status != 'archived'`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const internships = await sequelize.query(
      `SELECT id, title, description, speciality, doctor_id, requirements, 
              startDate, endDate, address${hasHospitalCol ? ', hospital' : hasHospitalIdCol ? ', hospital_id' : ''}${hasStatusCol ? ', status' : ''}, created_at
       FROM offers
       ${whereSQL}
       ORDER BY created_at DESC`,
      { replacements, type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: internships });
  } catch (error) {
    console.error('Error fetching internships for hospital', hospitalId, error);
    res.status(500).json({ success: false, message: 'Failed to fetch internships' });
  }
};

// Create an internship for a hospital
const createInternship = async (req, res) => {
  const hospitalId = req.params.id;
  const { title, description, speciality, doctor_id, startDate, endDate, address, requirements } = req.body;

  try {
    // Validation
    const missing = [];
    if (!title || String(title).trim() === '') missing.push('title');
    if (!speciality || String(speciality).trim() === '') missing.push('speciality');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing
      });
    }

    // Get hospital name
    const hospital = await sequelize.query(
      `SELECT name FROM hospitals WHERE id = ?`,
      { replacements: [hospitalId], type: QueryTypes.SELECT }
    );

    if (!hospital || hospital.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospitalName = hospital[0].name;

    // Insert new internship offer
    const hasStatusCol = await columnExists('offers', 'status');
    if (hasStatusCol) {
      await sequelize.query(
        `INSERT INTO offers (title, description, speciality, doctor_id, startDate, endDate, 
                            address, requirements, hospital, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        {
          replacements: [
            title.trim(),
            description ? description.trim() : null,
            speciality.trim(),
            doctor_id || null,
            startDate || null,
            endDate || null,
            address ? address.trim() : null,
            requirements ? requirements.trim() : null,
            hospitalName
          ]
        }
      );
    } else {
      await sequelize.query(
        `INSERT INTO offers (title, description, speciality, doctor_id, startDate, endDate, 
                            address, requirements, hospital, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            title.trim(),
            description ? description.trim() : null,
            speciality.trim(),
            doctor_id || null,
            startDate || null,
            endDate || null,
            address ? address.trim() : null,
            requirements ? requirements.trim() : null,
            hospitalName
          ]
        }
      );
    }

    // Get the inserted record
    const inserted = await sequelize.query(
      `SELECT * FROM offers WHERE id = LAST_INSERT_ID()`,
      { type: QueryTypes.SELECT }
    );

    res.status(201).json({
      success: true,
      message: 'Internship offer created successfully',
      data: inserted[0] || null
    });
  } catch (error) {
    console.error('Error creating internship for hospital', hospitalId, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create internship: ' + error.message
    });
  }
};

// Get doctors by hospital
// Robust version: prefer joined profiles, fall back to users and never return 500 for this endpoint
// Get doctors by hospital - Fixed to use doctor_profiles.hospital_id
const getDoctorsByHospital = async (req, res) => {
  const hospitalId = req.params.hospitalId;

  try {
    let doctors;
    
    // First try: Use doctor_profiles.hospital_id (since that's where the data is)
    try {
      doctors = await sequelize.query(
        `SELECT 
           u.id,
           u.first_name,
           u.last_name,
           u.email,
           dp.medical_specialty,
           dp.years_of_experience,
           dp.hospital_id
         FROM doctor_profiles dp
         JOIN users u ON dp.user_id = u.id
         WHERE dp.hospital_id = ? AND u.role = 'doctor' AND u.is_active = true
         ORDER BY u.first_name, u.last_name`,
        { replacements: [hospitalId], type: QueryTypes.SELECT }
      );
    } catch (innerErr) {
      console.warn('First query failed, trying fallback:', innerErr.message);
      
      // Fallback: Try users.hospital_id
      doctors = await sequelize.query(
        `SELECT 
           u.id,
           u.first_name,
           u.last_name,
           u.email,
           dp.medical_specialty,
           dp.years_of_experience,
           u.hospital_id
         FROM users u
         LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
         WHERE u.hospital_id = ? AND u.role = 'doctor' AND u.is_active = true
         ORDER BY u.first_name, u.last_name`,
        { replacements: [hospitalId], type: QueryTypes.SELECT }
      );
    }

    console.log(`✅ Found ${doctors.length} doctors for hospital ${hospitalId}`);
    
    res.json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors: ' + error.message
    });
  }
};

// Update an internship
const updateInternship = async (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};

  try {
    const allowed = ['title', 'description', 'speciality', 'doctor_id', 'requirements', 'startDate', 'endDate', 'address'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));

    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(id);

    // Only include status filter if column exists
    const hasStatusCol = await columnExists('offers', 'status');
    const whereStatus = hasStatusCol ? "AND status != 'archived'" : '';

    await sequelize.query(
      `UPDATE offers SET ${sets}, updated_at = NOW() WHERE id = ? ${whereStatus}`,
      { replacements: values }
    );

    // Check if any row was affected
    const result = await sequelize.query(
      `SELECT ROW_COUNT() as affectedRows`,
      { type: QueryTypes.SELECT }
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found or already archived'
      });
    }

    const updated = await sequelize.query(
      `SELECT * FROM offers WHERE id = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      message: 'Internship updated successfully',
      data: updated[0] || null
    });
  } catch (error) {
    console.error('Error updating internship', id, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update internship'
    });
  }
};

// Archive internship (soft-delete)
const archiveInternship = async (req, res) => {
  const id = req.params.id;
  try {
    // If the `status` column exists, use it. Otherwise add it and then update.
    const hasStatusCol = await columnExists('offers', 'status');
    if (!hasStatusCol) {
      try {
        await sequelize.query(`ALTER TABLE offers ADD COLUMN status VARCHAR(50) DEFAULT 'active'`);
        console.log('Added missing `status` column to offers table');
      } catch (alterErr) {
        console.warn('Failed to add status column to offers, proceeding without it:', alterErr.message);
      }
    }

    // Attempt to set status to archived; if column still missing, mark updated_at as a fallback
    const finalHasStatus = await columnExists('offers', 'status');
    if (finalHasStatus) {
      await sequelize.query(`UPDATE offers SET status = 'archived', updated_at = NOW() WHERE id = ?`, { replacements: [id] });
    } else {
      await sequelize.query(`UPDATE offers SET updated_at = NOW() WHERE id = ?`, { replacements: [id] });
    }

    // Check if any row was affected
    const result = await sequelize.query(
      `SELECT ROW_COUNT() as affectedRows`,
      { type: QueryTypes.SELECT }
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    res.json({
      success: true,
      message: 'Internship archived successfully'
    });
  } catch (error) {
    console.error('Error archiving internship', id, error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive internship'
    });
  }
};

// Get applications for a given internship
// In hospitalController.js - fix the getInternshipApplications function
const getInternshipApplications = async (req, res) => {
  const internshipId = req.params.id;
  try {
    const applications = await sequelize.query(
      `SELECT 
         a.*,
         u.first_name, 
         u.last_name, 
         u.email,
         u.phone,
         o.title as internship_title,
         o.hospital as hospital_name
       FROM applications a
       LEFT JOIN users u ON a.student_id = u.id
       LEFT JOIN offers o ON a.internship_id = o.id
       WHERE a.internship_id = ? 
       ORDER BY a.created_at DESC`,
      { replacements: [internshipId], type: QueryTypes.SELECT }
    );

    const fetchedCount = Array.isArray(applications) ? applications.length : 0;
    console.log('Found applications:', fetchedCount, 'for internship:', internshipId);

    // Format the response to use available fields
    const formattedApplications = (Array.isArray(applications) ? applications : []).map(app => ({
      id: app.id,
      internship_id: app.internship_id,
      student_id: app.student_id,
      status: app.status,
      cover_letter: app.cover_letter || app.application_text, // Use both fields
      application_text: app.application_text,
      created_at: app.created_at,
      updated_at: app.updated_at,
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      phone: app.phone,
      internship_title: app.internship_title,
      hospital_name: app.hospital_name
    }));
    
    res.json({ 
      success: true, 
      data: formattedApplications,
      count: formattedApplications.length 
    });
  } catch (error) {
    console.error('Error fetching applications for internship', internshipId, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications: ' + error.message 
    });
  }
};

// Update an application's status (approve/reject)
const updateApplicationStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status required: pending, approved, or rejected'
    });
  }

  try {
    await sequelize.query(
      `UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?`,
      { replacements: [status, id] }
    );

    const updated = await sequelize.query(
      `SELECT a.*, u.first_name, u.last_name, u.email
       FROM applications a
       JOIN users u ON a.student_id = u.id
       WHERE a.id = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: updated[0] || null
    });
  } catch (error) {
    console.error('Error updating application status', id, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
};

// List all internships (for students)
const listAllInternships = async (req, res) => {
  try {
    const hasStatus = await columnExists('offers', 'status');
    const where = hasStatus ? "WHERE status = 'active'" : '';
    const rows = await sequelize.query(
      `SELECT id, title, description, speciality, startDate, endDate, 
              hospital, address, doctor_id, requirements${hasStatus ? ', status' : ''}, created_at
       FROM offers 
       ${where}
       ORDER BY created_at DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error listing internships', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list internships'
    });
  }
};

// Get internship by id
const getInternshipById = async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await sequelize.query(
      // Only include status check if column exists
      `SELECT o.*, 
              u.first_name as doctor_first_name, 
              u.last_name as doctor_last_name,
              u.email as doctor_email
       FROM offers o
       LEFT JOIN users u ON o.doctor_id = u.id
       WHERE o.id = ? ${await columnExists('offers', 'status') ? "AND o.status != 'archived'" : ''}
       LIMIT 1`,
      { replacements: [id], type: QueryTypes.SELECT }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching internship', id, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internship'
    });
  }
};

module.exports = {
  getHospitals,
  getHospitalInternships,
  createInternship,
  updateInternship,
  archiveInternship,
  getInternshipApplications,
  updateApplicationStatus,
  listAllInternships,
  getInternshipById,
  getDoctorsByHospital,
};