const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Lấy tất cả người dùng (Chỉ dành cho Admin)
router.get('/all', authenticateToken, authorizeRole(['admin','staff']), userController.getAllUsers);

// Phân quyền người dùng (Chỉ dành cho Admin)
router.post('/assign-role', authenticateToken, authorizeRole(['admin']), userController.assignRole);

// Xóa người dùng (Chỉ dành cho Admin)
router.delete('/users/:id', authenticateToken, authorizeRole(['admin','staff']), userController.deleteUser);

module.exports = router;
