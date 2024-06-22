module.exports = (sequelize, DataTypes) => {
  const UserVoucher = sequelize.define('UserVoucher', {
    user_voucher_id: {
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
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vouchers',
        key: 'voucher_id'
      }
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {});

  UserVoucher.associate = (models) => {
    UserVoucher.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UserVoucher.belongsTo(models.Voucher, { foreignKey: 'voucher_id', as: 'voucher' });
  };

  return UserVoucher;
};
