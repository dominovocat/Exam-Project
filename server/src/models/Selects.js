const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Select extends Model {
    static associate() {}
  }

  Select.init(
    {
      type: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      describe: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Select",
      tableName: "Selects",
    }
  );

  return Select;
};
