const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HospitalAdminProfile = sequelize.define('HospitalAdminProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  hospital_department: { type: DataTypes.STRING(100), allowNull: false },
  position: { type: DataTypes.STRING(100), allowNull: false }
}, {
  tableName: 'hospital_admin_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HospitalAdminProfile;