const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizationMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const {
  getStats,
  getOrders,
  getProducts,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const orderController = require('../controllers/orderController');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// GET /admin/stats - Get system statistics
router.get('/stats', requirePermission('view_admin_stats'), getStats);

// GET /admin/orders - Get all orders with filters
router.get('/orders', requirePermission('view_orders'), getOrders);

// PUT /admin/orders/:orderId/status - Update order status (admin)
router.put('/orders/:orderId/status', requirePermission('update_order'), orderController.updateOrderStatus);

// PUT /admin/orders/:orderId/cancel - Cancel order (admin)
router.put('/orders/:orderId/cancel', requirePermission('cancel_order'), orderController.cancelOrder);

// GET /admin/products - Get all products with filters
router.get('/products', requirePermission('read_products'), getProducts);

// GET /admin/users - Get all users with filters
router.get('/users', requirePermission('view_users'), getUsers);

// POST /admin/users - Create new user
router.post('/users', requirePermission('create_user'), createUser);

// PUT /admin/users/:id - Update user
router.put('/users/:id', requirePermission('update_user'), updateUser);

// DELETE /admin/users/:id - Delete user
router.delete('/users/:id', requirePermission('delete_user'), deleteUser);

module.exports = router;
