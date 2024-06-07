module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('Categories', {
        category_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
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
      await queryInterface.dropTable('Categories');
    }
  };
  