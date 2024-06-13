

module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
      image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Articles',
          key: 'article_id'
        },
        onDelete: 'CASCADE'
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      timestamps: true
    });
  
    Image.associate = (models) => {
      Image.belongsTo(models.Article, { foreignKey: 'article_id', onDelete: 'CASCADE' });
    };
  
    return Image;
  };
  