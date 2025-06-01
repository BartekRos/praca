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
    allowNull: true, 
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
    type: DataTypes.JSON,
    allowNull: false, // zdjęcia są wymagane
    defaultValue: [],
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
