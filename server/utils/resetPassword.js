const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');

/**
 * Reset password for a specific user by email
 * Usage: node utils/resetPassword.js <email> <newPassword>
 * Example: node utils/resetPassword.js admin@internship.com admin123
 */

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: node utils/resetPassword.js <email> <newPassword>');
    console.error('Example: node utils/resetPassword.js user@example.com newPassword123');
    process.exit(1);
  }

  try {
    console.log(`🔄 Connecting to database...`);
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📧 User found: ${user.email} (ID: ${user.id})`);
    console.log(`🔐 Hashing new password (10 rounds)...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`💾 Updating password...`);
    await user.update({ password: hashedPassword });

    console.log(`✅ Password reset successful!`);
    console.log(`📝 User: ${user.email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`\n✨ You can now log in with this password.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetPassword();
