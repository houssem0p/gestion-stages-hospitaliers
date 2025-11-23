const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(191), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('student','doctor','teacher','hospital_admin','super_admin'), allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: true },
  last_name: { type: DataTypes.STRING(100), allowNull: true },
  specialty: { type: DataTypes.STRING(100), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  hospital_id: { type: DataTypes.INTEGER, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  profile_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Import profile models
const Student = require('./Student');
const Doctors = require('./Doctors');
const Teachers = require('./Teachers');
const Hospitals = require('./Hospitals');
//const SuperAdminProfile = require('./SuperAdminProfile');

// Define relationships
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
User.hasOne(Doctors, { foreignKey: 'user_id', as: 'doctorProfile' });
User.hasOne(Teachers, { foreignKey: 'user_id', as: 'teacherProfile' });
User.hasOne(Hospitals, { foreignKey: 'user_id', as: 'hospitalAdminProfile' });
//User.hasOne(SuperAdminProfile, { foreignKey: 'user_id', as: 'superAdminProfile' });

Student.belongsTo(User, { foreignKey: 'user_id' });
Doctors.belongsTo(User, { foreignKey: 'user_id' });
Teachers.belongsTo(User, { foreignKey: 'user_id' });
Hospitals.belongsTo(User, { foreignKey: 'user_id' });
//uperAdminProfile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = User;