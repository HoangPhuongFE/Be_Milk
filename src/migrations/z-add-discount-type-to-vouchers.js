'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Vouchers', 'discount_type', {
      type: Sequelize.ENUM('percentage', 'amount'),
      allowNull: false,
      defaultValue: 'percentage'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Vouchers', 'discount_type');
  }
};
