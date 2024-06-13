const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken } = require('../middlewares/auth');

// Định nghĩa các route cho voucher
router.post('/', authenticateToken, voucherController.createVoucher);
router.get('/', authenticateToken, voucherController.getAllVouchers);
router.get('/:voucher_id', authenticateToken, voucherController.getVoucherById);
router.put('/:voucher_id', authenticateToken, voucherController.updateVoucher);
router.delete('/:voucher_id', authenticateToken, voucherController.deleteVoucher);
router.post('/apply', authenticateToken, voucherController.applyVoucher);

module.exports = router;
