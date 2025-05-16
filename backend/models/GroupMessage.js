const { DataTypes } = require('sequelize');
const db = require('../config/db');

const GroupMessage = db.define('GroupMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  chatId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true,
  tableName: 'group_messages'
});

module.exports = GroupMessage;
