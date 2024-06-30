'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tạo bảng Vouchers
    await queryInterface.createTable('Vouchers', {
      voucher_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      discount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'amount'),
        allowNull: false,
        defaultValue: 'percentage'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      minimum_order_value: { 
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa bảng Vouchers
    await queryInterface.dropTable('Vouchers');
  }
};
