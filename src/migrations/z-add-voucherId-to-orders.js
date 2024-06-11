module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Orders', 'voucher_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Vouchers',
          key: 'voucher_id'
        },
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Orders', 'voucher_id');
    }
  };
  