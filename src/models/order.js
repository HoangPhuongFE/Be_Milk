module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Vouchers',
        key: 'voucher_id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {});

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.belongsTo(models.Voucher, { foreignKey: 'voucher_id', as: 'voucher' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return Order;
};
