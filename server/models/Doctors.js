const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoctorProfile = sequelize.define('DoctorProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  license_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  medical_specialty: { type: DataTypes.STRING(100), allowNull: false },
  years_of_experience: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'doctor_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DoctorProfile;