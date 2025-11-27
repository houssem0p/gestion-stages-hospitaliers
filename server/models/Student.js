const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentProfile = sequelize.define('StudentProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  first_name: { type: DataTypes.STRING(100), allowNull: true },
  last_name: { type: DataTypes.STRING(100), allowNull: true },
  matricule: { type: DataTypes.STRING(50), allowNull: true },
  speciality: { type: DataTypes.STRING(100), allowNull: true },
  academic_year: { type: DataTypes.STRING(20), allowNull: true }
}, {
  tableName: 'student_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StudentProfile;