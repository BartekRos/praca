const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ChatParticipant = db.define('ChatParticipant', {
  chatId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: false,
  tableName: 'chat_participants'
});

module.exports = ChatParticipant;
