const { Article, Image } = require('../models');
const fs = require('fs');
const path = require('path');

exports.createArticle = async (req, res) => {
  try {
    const { title,
       content,
        author ,
         image_url 
        } = req.body;
    const article = await Article.create({
      title, 
      content,
       author, 
       image_url });
    res.status(201).json({ message: 'Article created successfully', article });

  }catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.status(200).json(articles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  const { article_id } = req.params;

  try {
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateArticle = async (req, res) => {
  try{

     const { article_id } = req.params;
  const { title, 
    content,
     author, 
     image_url 
    } = req.body; 
  const article = await Article.findByPk(article_id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  article.title = title || article.title;
  article.content = content || article.content;  
  article.author = author || article.author; 
  article.image_url = image_url || article.image_url;
  await article.save();
  res.status(200).json(article);
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
