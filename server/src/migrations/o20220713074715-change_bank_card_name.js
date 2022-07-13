module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("Banks", "BankCards");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("BankCards", "Banks");
  },
};
