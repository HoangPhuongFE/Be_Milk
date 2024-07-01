const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Create a new review
router.post('/', authenticateToken, reviewController.createReview);

// Get all reviews for a specific product
router.get('/all', reviewController.getReviews);

// Get a single review by ID
router.get('/:review_id', reviewController.getReviewById);

// Update a review by ID
router.put('/:review_id', authenticateToken, reviewController.updateReview);

// Delete a review by ID
router.delete('/:review_id', authenticateToken, reviewController.deleteReview);

module.exports = router;
