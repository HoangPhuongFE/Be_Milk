'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'gender', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
