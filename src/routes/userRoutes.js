// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Đăng ký người dùng
router.post('/register', userController.register);

// Đăng nhập người dùng
router.post('/login', userController.login);

// Lấy thông tin người dùng
router.get('/profile', authenticateToken, authorizeRole(['user', 'admin', 'staff']), userController.getUser);

// Cập nhật thông tin người dùng
router.put('/profile', authenticateToken, authorizeRole(['user', 'admin', 'staff']), userController.updateUser);

// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
