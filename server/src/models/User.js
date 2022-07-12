const bcrypt = require("bcrypt");
const { CUSTOMER, CREATOR } = require("../constants");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "Users",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "anon.png",
      },
      role: {
        type: DataTypes.ENUM(CUSTOMER, CREATOR),
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      accessToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
    }
  );

  User.beforeCreate(async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password);
    user.password = hashedPassword;
  });

  // User.beforeUpdate(async (user,options)=>{
  //   const hashedPassword = await hashPassword(user.password);
  //   user.password = hashedPassword;
  // });

  User.associate = function (models) {
    User.hasMany(models.Order, { foreignKey: "user_id", targetKey: "id" });

    User.hasMany(models.Offer, { foreignKey: "user_id", targetKey: "id" });

    // User.hasMany(models.RefreshToken, {
    //   foreignKey: "user_id",
    //   targetKey: "id",
    // });
  };

  return User;
};
