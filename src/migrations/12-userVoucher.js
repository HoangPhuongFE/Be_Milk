module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserVouchers', {
      user_voucher_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        onDelete: 'CASCADE'
      },
      voucher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Vouchers',
          key: 'voucher_id'
        },
        onDelete: 'CASCADE'
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserVouchers');
  }
};
