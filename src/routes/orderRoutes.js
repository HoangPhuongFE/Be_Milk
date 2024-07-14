const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Định nghĩa các route cho đơn hàng
router.post('/', authenticateToken, orderController.createOrder); 
router.get('/user-order', authenticateToken, orderController.getUserOrders);
router.get('/all', authenticateToken, authorizeRole(['admin', 'staff']), orderController.getAllOrders); 
router.get('/:order_id', authenticateToken, orderController.getOrderById); 
router.put('/status', authenticateToken, authorizeRole(['admin', 'staff']), orderController.updateOrderStatus); 
router.delete('/:order_id', authenticateToken, authorizeRole(['admin', 'staff']), orderController.deleteOrder); 

module.exports = router;

