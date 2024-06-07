const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authenticateToken, authorizeRole(['admin', 'staff']), upload.array('images'), articleController.createArticle);
router.get('/', articleController.getArticles);
router.get('/:article_id', articleController.getArticleById);
router.put('/:article_id', authenticateToken, authorizeRole(['admin', 'staff']), upload.array('images'), articleController.updateArticle);
router.delete('/:article_id', authenticateToken, authorizeRole(['admin', 'staff']), articleController.deleteArticle);

module.exports = router;
