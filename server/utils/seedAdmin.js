const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sequelize } = require('../config/database'); // adjust if needed

async function seedAdmin() {
  try {
    await sequelize.sync();

    const email = 'adminn@internship.com';
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Admin already exists');
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin123', 10);

    await User.create({
      email,
      password: hashedPassword,
      role: 'super_admin',
      first_name: 'Super',
      last_name: 'Admin',
      is_active: true,
      profile_completed: true
    });

    console.log('Super admin created');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
