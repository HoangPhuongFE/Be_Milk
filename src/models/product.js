module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'category_id'
      }
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'out_of_stock', 'discontinued'),
      allowNull: true,
      defaultValue: 'available'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    placeOfProduction: {
      type: DataTypes.STRING,
      allowNull: true
    },
    warranty: {
      type: DataTypes.ENUM('no_warranty', '6_months', '1_year', '2_years'),
      allowNull: true
    },
    brandOfOrigin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numberOfSale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ingredient: {
      type: DataTypes.STRING,
      allowNull: true
    },
    outstandingFeatures: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userManual: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
    Product.hasMany(models.Review, { foreignKey: 'product_id', as: 'reviews' });
  };

  return Product;
};
