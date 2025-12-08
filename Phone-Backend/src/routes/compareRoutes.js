const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');

/**
 * @route   POST /api/compare
 * @desc    Compare multiple products (2-4 products)
 * @access  Public
 */
router.post('/', compareController.compareProducts);

/**
 * @route   GET /api/compare/similar/:productId
 * @desc    Get similar products for comparison
 * @access  Public
 */
router.get('/similar/:productId', compareController.getSimilarProducts);

module.exports = router;
