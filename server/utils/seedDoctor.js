const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorProfile = require('../models/Doctors');
const { sequelize } = require('../config/database');

async function seedDoctor() {
  try {
    await sequelize.sync();

    const email = process.argv[2] || 'doctor1@internship.com';
    const hospitalId = process.argv[3] ? parseInt(process.argv[3], 10) : 2;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Doctor user already exists:', email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Doctor123', 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'doctor',
      first_name: 'Dr',
      last_name: 'Seeded',
      is_active: true,
      profile_completed: true,
      hospital_id: hospitalId
    });

    // Create doctor profile if table exists
    try {
      await DoctorProfile.create({
        user_id: user.id,
        license_number: `LIC-${Date.now()}`,
        medical_specialty: 'General Medicine',
        years_of_experience: 5
      });
      console.log('Doctor profile created for user id', user.id);
    } catch (err) {
      console.warn('Could not create doctor profile (table may not exist):', err.message || err);
    }

    console.log('Doctor created:', { id: user.id, email: user.email, hospital_id: user.hospital_id });
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed doctor:', err);
    process.exit(1);
  }
}

seedDoctor();
