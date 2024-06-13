module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8],
          msg: 'Password must be at least 8 characters long'
        },
        is: {
          args: /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
          msg: 'Password must contain a special character'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    status: DataTypes.INTEGER,
    avatar_url: DataTypes.JSON,
    date_create: DataTypes.DATE,
    address: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: /^[0-9]{10,11}$/,
          msg: 'Phone number must be 10 or 11 digits long'
        }
      }
    },
    gender: DataTypes.ENUM('male', 'female', 'other'),  
    full_name: DataTypes.STRING,
    birthday: DataTypes.DATE,
    coin: DataTypes.INTEGER,
    email_verify_token: DataTypes.STRING,
    verify: DataTypes.INTEGER,
    forgot_password_token: DataTypes.STRING
  }, {});

  User.associate = function(models) {
  
  };
  User.associate = function(models) {
    User.hasMany(models.Chat, { foreignKey: 'user_id', as: 'chats' });
    User.hasMany(models.Chat, { foreignKey: 'recipient_id', as: 'receivedChats' });
  };

  return User;
};
