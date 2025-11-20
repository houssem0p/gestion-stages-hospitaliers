const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a direct Sequelize instance for seeding
const sequelize = new Sequelize(
  process.env.DB_NAME || 'internship_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Define User model directly in the seed file
const User = sequelize.define('User', {
  id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.DataTypes.STRING(191),
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: Sequelize.DataTypes.ENUM('student', 'doctor', 'teacher', 'hospital_admin', 'super_admin'),
    allowNull: false
  },
  first_name: {
    type: Sequelize.DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: Sequelize.DataTypes.STRING(100),
    allowNull: true
  },
  specialty: {
    type: Sequelize.DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: Sequelize.DataTypes.STRING(20),
    allowNull: true
  },
  hospital_id: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: Sequelize.DataTypes.BOOLEAN,
    defaultValue: true
  },
  profile_completed: {
    type: Sequelize.DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: Sequelize.DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const seedSuperAdmin = async () => {
  try {
    console.log('🌱 Starting super admin setup...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Sync the model
    await sequelize.sync();
    console.log('✅ Database synchronized');

    // Check if admin exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@internship.com' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Super admin already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      return;
    }
    
    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await User.create({
      email: 'admin@internship.com',
      password: hashedPassword,
      role: 'super_admin',
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true,
      profile_completed: true
    });
    
    console.log('🎉 Super admin created successfully!');
    console.log('====================================');
    console.log('📧 Email: admin@internship.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: super_admin');
    console.log('====================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('💡 Database error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedSuperAdmin().then(() => {
    console.log('🏁 Seed process completed');
    process.exit(0);
  });
}

module.exports = seedSuperAdmin;