const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Conversation = db.define('Conversation', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user1Id: { type: DataTypes.INTEGER, allowNull: false },
  user2Id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'conversations',
  timestamps: true,
});

module.exports = Conversation;
