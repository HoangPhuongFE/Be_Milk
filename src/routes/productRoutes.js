const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Tạo sản phẩm mới (Chỉ dành cho Admin)
router.post('/', authenticateToken, authorizeRole(['admin','staff']), productController.createProduct);

// Lấy danh sách sản phẩm
router.get('/', productController.getAllProducts);

// Lấy thông tin chi tiết sản phẩm
router.get('/:id', productController.getProductById);

// Cập nhật sản phẩm (Chỉ dành cho Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin','staff']), productController.updateProduct);

// Xóa sản phẩm (Chỉ dành cho Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin','staff']), productController.deleteProduct);
module.exports = router;
