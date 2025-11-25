const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// PayOS routes (webhook không cần auth)
router.post('/payos/webhook', paymentController.payosWebhook);

// User routes (authenticated)
router.post('/confirm', authenticateToken, paymentController.confirmPayment);
router.get('/:orderId', authenticateToken, paymentController.getPaymentStatus);

// PayOS payment routes (authenticated)
router.post('/payos/create', authenticateToken, paymentController.createPayOSPayment);
router.get('/payos/:orderCode/status', authenticateToken, paymentController.checkPayOSStatus);
router.post('/payos/:orderCode/cancel', authenticateToken, paymentController.cancelPayOSPayment);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeRole('admin'), paymentController.getAllPayments);

module.exports = router;
