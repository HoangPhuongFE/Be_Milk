module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('CartItems', {
        cart_item_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        cart_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Carts',
            key: 'cart_id'
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
      await queryInterface.dropTable('CartItems');
    }
  };
  