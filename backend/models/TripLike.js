const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const TripPost = require("./TripPost");
const User = require("./Users");

const TripLike = sequelize.define("TripLike", {}, {
  indexes: [
    {
      unique: true,
      fields: ["tripPostId", "userId"]
    }
  ]
});

TripLike.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
TripLike.belongsTo(TripPost, { foreignKey: "tripPostId", onDelete: "CASCADE" });
TripPost.hasMany(TripLike, { foreignKey: "tripPostId" });

module.exports = TripLike;
