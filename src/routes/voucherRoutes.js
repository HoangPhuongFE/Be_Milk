const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken ,authorizeRole } = require('../middlewares/auth');

// Định nghĩa các route cho voucher
router.post('/', authenticateToken,authorizeRole(['admin','staff']), voucherController.createVoucher);
router.get('/', authenticateToken, voucherController.getAllVouchers);
router.get('/:voucher_id', authenticateToken,authorizeRole(['admin','staff','user']), voucherController.getVoucherById);
router.put('/:voucher_id', authenticateToken,authorizeRole(['admin','staff']), voucherController.updateVoucher);
router.delete('/:voucher_id', authenticateToken,authorizeRole(['admin','staff']), voucherController.deleteVoucher);
router.post('/apply', authenticateToken, voucherController.applyVoucher);

module.exports = router;
