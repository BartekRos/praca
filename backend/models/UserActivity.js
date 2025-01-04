const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserActivity = sequelize.define('UserActivity', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = UserActivity;
