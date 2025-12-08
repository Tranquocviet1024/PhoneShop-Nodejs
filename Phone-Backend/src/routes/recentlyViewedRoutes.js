const express = require('express');
const router = express.Router();
const recentlyViewedController = require('../controllers/recentlyViewedController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/recently-viewed
 * @desc    Get user's recently viewed products
 * @access  Private
 */
router.get('/', recentlyViewedController.getRecentlyViewed);

/**
 * @route   POST /api/recently-viewed
 * @desc    Add product to recently viewed
 * @access  Private
 */
router.post('/', recentlyViewedController.addToRecentlyViewed);

/**
 * @route   DELETE /api/recently-viewed/clear
 * @desc    Clear all recently viewed history
 * @access  Private
 */
router.delete('/clear', recentlyViewedController.clearRecentlyViewed);

/**
 * @route   DELETE /api/recently-viewed/:productId
 * @desc    Remove product from recently viewed
 * @access  Private
 */
router.delete('/:productId', recentlyViewedController.removeFromRecentlyViewed);

module.exports = router;
