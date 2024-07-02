// routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

//  Thống kê doanh thu theo thời gian 
router.get('/revenue-statistics', authenticateToken, authorizeRole(['admin', 'staff']), statisticsController.getRevenueStatistics);
// thống kê số lượng đơn hàng theo trạng thái
router.get('/order-status-counts', authenticateToken, authorizeRole(['admin', 'staff']), statisticsController.getOrderStatusCounts);
// thống kê sản phẩm bán chạy nhất
router.get('/top-selling-products', authenticateToken, authorizeRole(['admin', 'staff']), statisticsController.getTopSellingProducts);
// thống kê khách hàng
router.get('/customer-statistics', authenticateToken, authorizeRole(['admin', 'staff']), statisticsController.getCustomerStatistics);
// thông kê doanh thu theo phương thức thanh toán
router.get('/revenue-by-payment-method', authenticateToken, authorizeRole(['admin', 'staff']), statisticsController.getRevenueByPaymentMethod);

module.exports = router;
