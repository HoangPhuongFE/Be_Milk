const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, chatController.createMessage);
router.get('/:recipient_id', authenticateToken, chatController.getMessages);

module.exports = router;
