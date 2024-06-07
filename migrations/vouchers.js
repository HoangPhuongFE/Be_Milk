module.exports = {
    up: async (queryInterface, Sequelize) => {
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
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('Vouchers');
    }
  };
  