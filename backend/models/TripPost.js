const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./Users");

const TripPost = sequelize.define("TripPost", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  locationData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  photos: {
    type: DataTypes.JSON, // tablica ścieżek do zdjęć
    defaultValue: [],
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

User.hasMany(TripPost, { foreignKey: "userId", onDelete: "CASCADE" });
TripPost.belongsTo(User, { foreignKey: "userId" });

module.exports = TripPost;
