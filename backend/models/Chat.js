const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Chat = db.define('Chat', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true,
  tableName: 'chats'
});

module.exports = Chat;
