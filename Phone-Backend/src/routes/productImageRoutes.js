const express = require('express');
const router = express.Router();
const productImageController = require('../controllers/productImageController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products/:productId/images
 * @desc    Get all images for a product
 * @access  Public
 */
router.get('/:productId/images', productImageController.getProductImages);

// Admin routes
router.use(authenticateToken, authorizeRole(['ADMIN']));

/**
 * @route   POST /api/products/:productId/images
 * @desc    Add single image to product
 * @access  Admin
 */
router.post('/:productId/images', productImageController.addProductImage);

/**
 * @route   POST /api/products/:productId/images/bulk
 * @desc    Add multiple images to product
 * @access  Admin
 */
router.post('/:productId/images/bulk', productImageController.addMultipleImages);

/**
 * @route   PUT /api/products/:productId/images/:imageId
 * @desc    Update product image
 * @access  Admin
 */
router.put('/:productId/images/:imageId', productImageController.updateProductImage);

/**
 * @route   PUT /api/products/:productId/images/:imageId/primary
 * @desc    Set image as primary
 * @access  Admin
 */
router.put('/:productId/images/:imageId/primary', productImageController.setPrimaryImage);

/**
 * @route   DELETE /api/products/:productId/images/:imageId
 * @desc    Delete product image
 * @access  Admin
 */
router.delete('/:productId/images/:imageId', productImageController.deleteProductImage);

/**
 * @route   PUT /api/products/:productId/images/reorder
 * @desc    Reorder product images
 * @access  Admin
 */
router.put('/:productId/images/reorder', productImageController.reorderImages);

module.exports = router;
