const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./Users");

const Post = sequelize.define("Post", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travelDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceFrom: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  priceTo: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  maxPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

// Relacja: 1 użytkownik może mieć wiele postów
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

module.exports = Post;
