const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const TripPost = require("./TripPost");
const User = require("./Users");

const TripComment = sequelize.define("TripComment", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

TripComment.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
TripComment.belongsTo(TripPost, { foreignKey: "tripPostId", onDelete: "CASCADE" });
TripPost.hasMany(TripComment, { foreignKey: "tripPostId" });

module.exports = TripComment;
