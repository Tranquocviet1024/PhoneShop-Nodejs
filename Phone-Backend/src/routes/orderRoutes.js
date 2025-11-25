const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// User routes
router.post('/', authenticateToken, requirePermission('create_order'), orderController.createOrder);
router.get('/', authenticateToken, requirePermission('view_orders'), orderController.getUserOrders);
router.get('/:orderId', authenticateToken, requirePermission('view_orders'), orderController.getOrderById);
router.post('/:orderId/cancel', authenticateToken, requirePermission('cancel_order'), orderController.cancelOrder);

// Admin routes
router.get('/admin/all', authenticateToken, requirePermission('view_orders'), orderController.getAllOrders);
router.put('/:orderId/status', authenticateToken, requirePermission('update_order'), orderController.updateOrderStatus);

module.exports = router;
