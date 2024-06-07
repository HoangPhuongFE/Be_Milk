const { Article, Image } = require('../models');
const fs = require('fs');
const path = require('path');

exports.createArticle = async (req, res) => {
  const { title, content, author } = req.body;
  const images = req.files;

  try {
    const article = await Article.create({ title, content, author });

    const imagePromises = images.map(file => {
      const imagePath = path.join('uploads', file.filename);
      return Image.create({ article_id: article.article_id, url: imagePath });
    });

    await Promise.all(imagePromises);

    const createdArticle = await Article.findByPk(article.article_id, { include: 'images' });

    res.status(201).json(createdArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({ include: 'images' });
    const articlesWithPublicUrls = articles.map(article => ({
      ...article.toJSON(),
      images: article.images.map(image => ({
        ...image.toJSON(),
        url: `${req.protocol}://${req.get('host')}/${image.url}`
      }))
    }));
    res.status(200).json(articlesWithPublicUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  const { article_id } = req.params;

  try {
    const article = await Article.findByPk(article_id, { include: 'images' });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const articleWithPublicUrls = {
      ...article.toJSON(),
      images: article.images.map(image => ({
        ...image.toJSON(),
        url: `${req.protocol}://${req.get('host')}/${image.url}`
      }))
    };

    res.status(200).json(articleWithPublicUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  const { article_id } = req.params;
  const { title, content, author } = req.body;
  const images = req.files;

  try {
    const article = await Article.findByPk(article_id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.title = title;
    article.content = content;
    article.author = author;
    await article.save();

    if (images) {
      // Xóa ảnh cũ
      await Image.destroy({ where: { article_id } });

      const imagePromises = images.map(file => {
        const imagePath = path.join('uploads', file.filename);
        return Image.create({ article_id: article.article_id, url: imagePath });
      });

      await Promise.all(imagePromises);
    }

    const updatedArticle = await Article.findByPk(article.article_id, { include: 'images' });

    const articleWithPublicUrls = {
      ...updatedArticle.toJSON(),
      images: updatedArticle.images.map(image => ({
        ...image.toJSON(),
        url: `${req.protocol}://${req.get('host')}/${image.url}`
      }))
    };

    res.status(200).json(articleWithPublicUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  const { article_id } = req.params;

  try {
    const article = await Article.findByPk(article_id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await article.destroy();
    res.status(200).json({ message: 'Article deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
