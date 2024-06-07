const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Định nghĩa các route cho phương thức thanh toán
router.post('/', authenticateToken, authorizeRole(['admin']), paymentMethodController.createPaymentMethod);
router.get('/', authenticateToken, paymentMethodController.getPaymentMethods);
router.put('/:method_id', authenticateToken, authorizeRole(['admin']), paymentMethodController.updatePaymentMethod);
router.delete('/:method_id', authenticateToken, authorizeRole(['admin']), paymentMethodController.deletePaymentMethod);

module.exports = router;
