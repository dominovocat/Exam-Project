const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const { CUSTOMER, CREATOR, SALT_ROUNDS } = require("../constants");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Offer, { foreignKey: "userId", targetKey: "id" });

      User.hasMany(models.RefreshToken, {
        foreignKey: "userId",
        targetKey: "id",
      });

      User.hasMany(models.Contest, {
        foreignKey: "userId",
        targetKey: "id",
      });

      User.hasMany(models.Rating, {
        foreignKey: "userId",
        targetKey: "id",
      });
    }
  }

  User.init(
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
      sequelize,
      timestamps: false,
      modelName: "User",
      tableName: "Users",
    }
  );

  User.beforeCreate (async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password,SALT_ROUNDS);
    user.password = hashedPassword;
  });

  User.beforeUpdate(async (user, options) => {
    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      user.password = hashedPassword;
    }
  });

  return User;
};
