module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('OrderItems', {
        order_item_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Orders',
            key: 'order_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        price: {
          type: Sequelize.FLOAT,
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
      await queryInterface.dropTable('OrderItems');
    }
  };
  