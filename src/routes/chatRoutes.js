const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken , authorizeRole} = require('../middlewares/auth');


// Tạo tin nhắn mới
router.post('/', authenticateToken, chatController.createMessage);

// Lấy tất cả cuộc trò chuyện của admin và staff
router.get('/messagers', authenticateToken, authorizeRole(['admin', 'staff']), chatController.getMessagers);

// Lấy tất cả tin nhắn của một cuộc trò chuyện dành cho admin và staff
router.get('/messagers/:messager_id', authenticateToken, authorizeRole(['admin', 'staff']), chatController.getChatsByMessagerId);

// Lấy tất cả cuộc trò chuyện của người dùng bình thường
router.get('/user/messagers', authenticateToken, chatController.getUserMessagers);

// Lấy tất cả tin nhắn của một cuộc trò chuyện dành cho người dùng bình thường
router.get('/user/messagers/:messager_id', authenticateToken, chatController.getUserChatsByMessagerId);

// Xóa một cuộc trò chuyện
router.delete('/messagers/:messager_id', authenticateToken, authorizeRole(['admin', 'staff']), chatController.deleteMessager);

module.exports = router;
