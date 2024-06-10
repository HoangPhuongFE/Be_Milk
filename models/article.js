module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define('Article', {
      article_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      }
    ,
      image_url: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      timestamps: true
    });
  
    Article.associate = (models) => {
      Article.hasMany(models.Image, { foreignKey: 'article_id', as: 'images' });
    };
  
    return Article;
  };
  