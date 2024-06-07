module.exports = (sequelize, DataTypes) => {
    const PaymentMethod = sequelize.define('PaymentMethod', {
      method_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      method_name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {});
  
    return PaymentMethod;
  };
  