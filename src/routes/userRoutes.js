const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Đăng ký người dùng
router.post('/register', userController.register);

// Đăng nhập người dùng
router.post('/login', userController.login);

// Lấy thông tin người dùng
router.get('/profile', authenticateToken, userController.getUser);

// Lấy tất cả người dùng (Chỉ dành cho Admin)
router.get('/all', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);

// Cập nhật thông tin người dùng
router.put('/profile', authenticateToken, userController.updateUser);

// Phân quyền người dùng (Chỉ dành cho Admin)
router.post('/assign-role', authenticateToken, authorizeRole(['admin']), userController.assignRole);

// Xóa người dùng (Chỉ dành cho Admin)
router.delete('/profile/:id', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
