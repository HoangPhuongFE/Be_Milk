module.exports = (sequelize, DataTypes) => {
    const Messager = sequelize.define('Messager', {
      messager_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: true
    });
  
    Messager.associate = (models) => {
      Messager.belongsTo(models.User, { foreignKey: 'user1_id', as: 'user1' });
      Messager.belongsTo(models.User, { foreignKey: 'user2_id', as: 'user2' });
      Messager.hasMany(models.Chat, { foreignKey: 'messager_id', as: 'chats' });
    };
  
    return Messager;
  };
  