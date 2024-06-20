'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Vouchers', 'minimum_order_value', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Vouchers', 'used', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Vouchers', 'minimum_order_value');
    await queryInterface.removeColumn('Vouchers', 'used');
  }
};
