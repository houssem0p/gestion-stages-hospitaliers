const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  message_type: {
    type: DataTypes.ENUM('student_mentor', 'student_hospital', 'mentor_hospital', 'admin_broadcast'),
    defaultValue: 'student_mentor'
  },
  subject: { type: DataTypes.STRING(200), allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  internship_id: { type: DataTypes.INTEGER, allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  read_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Message;

