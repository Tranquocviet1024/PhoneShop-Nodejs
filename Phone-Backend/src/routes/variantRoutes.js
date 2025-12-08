const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products/:productId/variants
 * @desc    Get all variants for a product
 * @access  Public
 */
router.get('/:productId/variants', variantController.getProductVariants);

/**
 * @route   GET /api/products/:productId/variants/find
 * @desc    Get variant by color and storage options
 * @access  Public
 */
router.get('/:productId/variants/find', variantController.getVariantByOptions);

/**
 * @route   GET /api/products/:productId/variants/stock
 * @desc    Get total stock of all variants
 * @access  Public
 */
router.get('/:productId/variants/stock', variantController.getTotalStock);

// Admin routes
router.use(authenticateToken, authorizeRole(['ADMIN']));

/**
 * @route   POST /api/products/:productId/variants
 * @desc    Create new variant
 * @access  Admin
 */
router.post('/:productId/variants', variantController.createVariant);

/**
 * @route   POST /api/products/:productId/variants/bulk
 * @desc    Create multiple variants
 * @access  Admin
 */
router.post('/:productId/variants/bulk', variantController.createBulkVariants);

/**
 * @route   PUT /api/products/:productId/variants/:variantId
 * @desc    Update variant
 * @access  Admin
 */
router.put('/:productId/variants/:variantId', variantController.updateVariant);

/**
 * @route   PUT /api/products/:productId/variants/:variantId/stock
 * @desc    Update variant stock
 * @access  Admin
 */
router.put('/:productId/variants/:variantId/stock', variantController.updateVariantStock);

/**
 * @route   DELETE /api/products/:productId/variants/:variantId
 * @desc    Delete variant (soft delete)
 * @access  Admin
 */
router.delete('/:productId/variants/:variantId', variantController.deleteVariant);

module.exports = router;
