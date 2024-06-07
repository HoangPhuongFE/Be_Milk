const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Tạo danh mục mới (Chỉ dành cho Admin)
router.post('/', authenticateToken, authorizeRole(['admin']), categoryController.createCategory);

// Lấy danh sách danh mục
router.get('/', categoryController.getAllCategories);

// Lấy thông tin chi tiết danh mục
router.get('/:id', categoryController.getCategoryById);

// Cập nhật danh mục (Chỉ dành cho Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), categoryController.updateCategory);

// Xóa danh mục (Chỉ dành cho Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), categoryController.deleteCategory);

module.exports = router;
