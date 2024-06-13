const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/auth');

// Tạo tin nhắn mới
router.post('/', authenticateToken, chatController.createMessage);

// Lấy tất cả tin nhắn
router.get('/', authenticateToken, chatController.getMessages);

module.exports = router;
