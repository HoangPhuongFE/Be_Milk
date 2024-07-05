const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

router.post('/pay', authenticateToken, paymentController.createPayment);
router.get('/success', paymentController.executePayment);
router.get('/cancel', paymentController.cancelPayment);

module.exports = router;
