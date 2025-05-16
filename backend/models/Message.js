const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Message = db.define('Message', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  receiverId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true,
  tableName: 'messages'
});

module.exports = Message;
