const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes (all require authentication)
router.get('/', authenticateToken, cartController.getCart);
router.post('/save', authenticateToken, cartController.saveCart);
router.post('/add', authenticateToken, cartController.addToCart);
router.delete('/:productId', authenticateToken, cartController.removeFromCart);
router.delete('/', authenticateToken, cartController.clearCart);

module.exports = router;
