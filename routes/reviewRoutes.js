const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
//const { authenticateToken } = require('../middlewares/auth');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, reviewController.createReview);
router.get('/:product_id', reviewController.getReviews);
router.get('/review/:review_id', reviewController.getReviewById);
router.put('/review/:review_id', authenticateToken, reviewController.updateReview);
router.delete('/review/:review_id', authenticateToken, reviewController.deleteReview);

module.exports = router;
