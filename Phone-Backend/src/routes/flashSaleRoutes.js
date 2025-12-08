const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSaleController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public routes
/**
 * @route   GET /api/flash-sales/active
 * @desc    Get active flash sales
 * @access  Public
 */
router.get('/active', flashSaleController.getActiveFlashSales);

/**
 * @route   GET /api/flash-sales/upcoming
 * @desc    Get upcoming flash sales
 * @access  Public
 */
router.get('/upcoming', flashSaleController.getUpcomingFlashSales);

/**
 * @route   GET /api/flash-sales/:id
 * @desc    Get flash sale by ID
 * @access  Public
 */
router.get('/:id', flashSaleController.getFlashSaleById);

// Admin routes
router.use(authenticateToken, authorizeRole(['ADMIN']));

/**
 * @route   GET /api/flash-sales
 * @desc    Get all flash sales (admin)
 * @access  Admin
 */
router.get('/', flashSaleController.getAllFlashSales);

/**
 * @route   POST /api/flash-sales
 * @desc    Create new flash sale
 * @access  Admin
 */
router.post('/', flashSaleController.createFlashSale);

/**
 * @route   PUT /api/flash-sales/:id
 * @desc    Update flash sale
 * @access  Admin
 */
router.put('/:id', flashSaleController.updateFlashSale);

/**
 * @route   DELETE /api/flash-sales/:id
 * @desc    Delete flash sale
 * @access  Admin
 */
router.delete('/:id', flashSaleController.deleteFlashSale);

/**
 * @route   POST /api/flash-sales/:flashSaleId/items
 * @desc    Add product to flash sale
 * @access  Admin
 */
router.post('/:flashSaleId/items', flashSaleController.addFlashSaleItem);

/**
 * @route   DELETE /api/flash-sales/:flashSaleId/items/:itemId
 * @desc    Remove product from flash sale
 * @access  Admin
 */
router.delete('/:flashSaleId/items/:itemId', flashSaleController.removeFlashSaleItem);

module.exports = router;
