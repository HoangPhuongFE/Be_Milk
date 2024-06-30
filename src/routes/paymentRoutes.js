const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const paymentController = require('../controllers/paymentController');

router.post('/create-payment', paymentController.createPaymentUrl);
router.get('/vnpay_return', paymentController.vnpayReturn);
=======
const paymentController = require('../controllers/paymentController'); // Đảm bảo đúng đường dẫn tới controller

router.post('/pay', paymentController.createPayment);
router.get('/success', paymentController.executePayment);
router.get('/cancel', paymentController.cancelPayment);
>>>>>>> 50b3931a78e4d92c2c0d3e093c1754bfbcd61e06

module.exports = router;
