const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id: { type: DataTypes.INTEGER, allowNull: false },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'message_attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = MessageAttachment;

