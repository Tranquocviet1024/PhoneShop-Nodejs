const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticateToken, authorizeRole(['ADMIN']));

/**
 * @route   GET /api/inventory/check
 * @desc    Check inventory and create alerts
 * @access  Admin
 */
router.get('/check', inventoryController.checkInventory);

/**
 * @route   GET /api/inventory/alerts
 * @desc    Get inventory alerts
 * @access  Admin
 */
router.get('/alerts', inventoryController.getAlerts);

/**
 * @route   GET /api/inventory/stats
 * @desc    Get inventory statistics
 * @access  Admin
 */
router.get('/stats', inventoryController.getInventoryStats);

/**
 * @route   PUT /api/inventory/alerts/:id/resolve
 * @desc    Resolve an inventory alert
 * @access  Admin
 */
router.put('/alerts/:id/resolve', inventoryController.resolveAlert);

/**
 * @route   PUT /api/inventory/threshold/:productId
 * @desc    Update alert threshold for a product
 * @access  Admin
 */
router.put('/threshold/:productId', inventoryController.updateThreshold);

module.exports = router;
