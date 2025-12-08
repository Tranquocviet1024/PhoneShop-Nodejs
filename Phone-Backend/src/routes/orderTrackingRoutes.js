const express = require('express');
const orderTrackingController = require('../controllers/orderTrackingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// User routes
router.get('/:orderId', authenticateToken, orderTrackingController.getOrderTracking);

// Admin routes
router.post('/:orderId/event', authenticateToken, requirePermission('update_order'), orderTrackingController.addTrackingEvent);
router.post('/:orderId/location', authenticateToken, requirePermission('update_order'), orderTrackingController.updateShippingLocation);
router.get('/', authenticateToken, requirePermission('view_orders'), orderTrackingController.getOrdersByTrackingStatus);

module.exports = router;
