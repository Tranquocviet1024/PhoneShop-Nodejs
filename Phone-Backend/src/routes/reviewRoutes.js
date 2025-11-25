const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/:productId', reviewController.getProductReviews);

// User routes
router.post('/:productId', authenticateToken, reviewController.addReview);
router.put('/:reviewId', authenticateToken, reviewController.updateReview);
router.delete('/:reviewId', authenticateToken, reviewController.deleteReview);

module.exports = router;
