const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherProfile = sequelize.define('TeacherProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_area: { type: DataTypes.STRING(100), allowNull: false },
  academic_rank: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'teacher_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TeacherProfile;