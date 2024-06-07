const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/auth');

// Định nghĩa các route cho giỏ hàng
router.post('/add', authenticateToken, cartController.addItemToCart);
router.get('/', authenticateToken, cartController.getCart);
router.put('/update', authenticateToken, cartController.updateCartItem);
router.delete('/remove/:cart_item_id', authenticateToken, cartController.removeItemFromCart);

module.exports = router;
