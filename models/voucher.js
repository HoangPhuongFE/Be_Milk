module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    voucher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'amount'),
      allowNull: false,
      defaultValue: 'percentage'
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {});

  return Voucher;
};
