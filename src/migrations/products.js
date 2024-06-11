module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Change this to 'CASCADE' or 'RESTRICT'
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'out_of_stock', 'discontinued'),
        allowNull: false,
        defaultValue: 'available'
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      placeOfProduction: {
        type: Sequelize.STRING,
        allowNull: true
      },
      warranty: {
        type: Sequelize.ENUM('no_warranty', '6_months', '1_year', '2_years'),
        allowNull: true
      },
      brandOfOrigin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      numberOfSale: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ingredient: {
        type: Sequelize.STRING,
        allowNull: true
      },
      outstandingFeatures: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userManual: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('Products');
  }
};
