const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Định nghĩa các route cho phương thức thanh toán
router.post('/', authenticateToken, authorizeRole(['admin','staff']), paymentMethodController.createPaymentMethod);
router.get('/', paymentMethodController.getPaymentMethods);
router.put('/:method_id', authenticateToken, authorizeRole(['admin','staff']), paymentMethodController.updatePaymentMethod);
router.delete('/:method_id', authenticateToken, authorizeRole(['admin','staff']), paymentMethodController.deletePaymentMethod);

module.exports = router;
