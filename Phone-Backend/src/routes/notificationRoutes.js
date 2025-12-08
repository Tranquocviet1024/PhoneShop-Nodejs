const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// User routes
router.get('/', authenticateToken, notificationController.getNotifications);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);
router.delete('/read/all', authenticateToken, notificationController.deleteReadNotifications);

// Admin routes
router.post('/promotion', authenticateToken, requirePermission('send_notifications'), notificationController.sendPromotionNotification);

module.exports = router;
