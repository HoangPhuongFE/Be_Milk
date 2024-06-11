module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      chat_id: {
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
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: true
    });
  
    Chat.associate = (models) => {
      Chat.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
      Chat.belongsTo(models.User, { foreignKey: 'recipient_id', as: 'recipient', onDelete: 'CASCADE' });
    };
  
    return Chat;
  };
  