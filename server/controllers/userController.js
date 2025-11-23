const User = require('../models/User');
const Student = require('../models/Student');
const Doctors = require('../models/Doctors');
const Teachers = require('../models/Teachers');
const Hospitals = require('../models/Hospitals');
//const SuperAdminProfile = require('../models/SuperAdminProfile');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, specialty, phone, hospital_id, extra } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ success:false, message:'Email, password, and role required' });
    
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success:false, message:'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email, 
      password: hashed, 
      role, 
      first_name, 
      last_name, 
      specialty, 
      phone, 
      hospital_id,
      is_active: true, 
      profile_completed: false, 
      created_by: req.user.userId,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create role-specific profile
    try {
      switch(role) {
        case 'student':
          if (!extra.student_number || !extra.department) {
            return res.status(400).json({ 
              success: false, 
              message: 'Student number and department are required for students' 
            });
          }
          await Student.create({
            user_id: newUser.id,
            student_number: extra.student_number,
            department: extra.department,
            academic_year: extra.academic_year
          });
          break;

        case 'doctor':
          if (!extra.license_number || !extra.medical_specialty) {
            return res.status(400).json({ 
              success: false, 
              message: 'License number and medical specialty are required for doctors' 
            });
          }
          await Doctors.create({
            user_id: newUser.id,
            license_number: extra.license_number,
            medical_specialty: extra.medical_specialty,
            years_of_experience: extra.years_of_experience
          });
          break;

        case 'teacher':
          if (!extra.subject_area) {
            return res.status(400).json({ 
              success: false, 
              message: 'Subject area is required for teachers' 
            });
          }
          await Teachers.create({
            user_id: newUser.id,
            subject_area: extra.subject_area,
            academic_rank: extra.academic_rank
          });
          break;

        case 'hospital_admin':
          if (!extra.hospital_department || !extra.position) {
            return res.status(400).json({ 
              success: false, 
              message: 'Department and position are required for hospital admins' 
            });
          }
          await Hospitals.create({
            user_id: newUser.id,
            hospital_department: extra.hospital_department,
            position: extra.position
          });
          break;

        case 'super_admin':
          // Skip super admin profile for now since it's commented out
          console.log('Super admin created - no profile table yet');
          break;
      }
    } catch (profileError) {
      // If profile creation fails, delete the user and return error
      await User.destroy({ where: { id: newUser.id } });
      console.error('Profile creation error:', profileError);
      return res.status(400).json({ 
        success: false, 
        message: 'Error creating user profile: ' + profileError.message 
      });
    }

    const userResponse = { ...newUser.toJSON() }; 
    delete userResponse.password;

    res.status(201).json({ success:true, message:'User created successfully', user:userResponse });
  } catch(err) {
    console.error('User creation error:', err);
    res.status(500).json({ success:false, message:'Error creating user' });
  }
};

// Get users with their profiles
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { exclude:['password'] }, 
      order:[['created_at','DESC']],
      include: [
        { model: Student, as: 'studentProfile', required: false },
        { model: Doctors, as: 'doctorProfile', required: false },
        { model: Teachers, as: 'teacherProfile', required: false },
        { model: Hospitals, as: 'hospitalAdminProfile', required: false },
      ]
    });
    res.json({ success:true, users });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error fetching users' });
  }
};

// Update getDashboardStats to use new tables
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    
    // Count from profile tables - use the actual model names
    const totalStudents = await Student.count();
    const totalDoctors = await Doctors.count();
    const totalTeachers = await Teachers.count();
    const totalHospitalAdmins = await Hospitals.count();
    // const totalSuperAdmins = await SuperAdminProfile.count();

    res.json({
      success: true,
      stats: { 
        totalUsers, 
        activeUsers,
        totalStudents,
        totalDoctors, 
        totalTeachers,
        totalHospitalAdmins,
        // totalSuperAdmins
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

// Keep other functions the same
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.update(req.body);
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { is_active } = req.body;
    await user.update({ is_active });
    res.json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
};