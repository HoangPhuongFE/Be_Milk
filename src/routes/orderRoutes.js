const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Định nghĩa các route cho đơn hàng
router.post('/', authenticateToken, orderController.createOrder); // Yêu cầu xác thực để tạo đơn hàng
router.get('/', authenticateToken, authorizeRole(['admin', 'staff']), orderController.getAllOrders); // Yêu cầu xác thực và quyền admin hoặc staff để lấy tất cả đơn hàng
router.get('/:order_id', authenticateToken, orderController.getOrderById); // Yêu cầu xác thực để xem chi tiết đơn hàng
router.put('/status', authenticateToken, authorizeRole(['admin', 'staff']), orderController.updateOrderStatus); // Yêu cầu xác thực để cập nhật trạng thái đơn hàng
router.delete('/:order_id', authenticateToken, authorizeRole(['admin', 'staff']), orderController.deleteOrder); // Yêu cầu xác thực để xóa đơn hàng

module.exports = router;

