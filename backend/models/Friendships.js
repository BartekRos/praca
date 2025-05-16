const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Users = require('./Users');

const Friendship = sequelize.define('Friendship', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  friendId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted'), defaultValue: 'pending' },
}, {
  timestamps: true,
});

// RELACJE
Friendship.belongsTo(Users, { as: 'sender', foreignKey: 'userId' });
Friendship.belongsTo(Users, { as: 'receiver', foreignKey: 'friendId' });

module.exports = Friendship;
