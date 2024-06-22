'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Vouchers', 'minimum_order_value', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
   
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Vouchers', 'minimum_order_value');
  }
};
