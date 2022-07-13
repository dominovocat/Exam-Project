const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BankCard extends Model {
    static associate() {}
  }

  BankCard.init(
    {
      cardNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cvc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "BankCard",
      tableName: "BankCards",
    }
  );

  return BankCard;
};
