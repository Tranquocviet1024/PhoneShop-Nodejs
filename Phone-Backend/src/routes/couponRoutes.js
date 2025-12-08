const express = require('express');
const couponController = require('../controllers/couponController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// Public/User routes
router.post('/validate', authenticateToken, couponController.validateCoupon);
router.get('/available', authenticateToken, couponController.getAvailableCoupons);

// Admin routes
router.get('/', authenticateToken, requirePermission('manage_coupons'), couponController.getAllCoupons);
router.post('/', authenticateToken, requirePermission('manage_coupons'), couponController.createCoupon);
router.put('/:id', authenticateToken, requirePermission('manage_coupons'), couponController.updateCoupon);
router.delete('/:id', authenticateToken, requirePermission('manage_coupons'), couponController.deleteCoupon);

module.exports = router;
