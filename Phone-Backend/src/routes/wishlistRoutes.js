const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả routes cần đăng nhập
router.use(authenticateToken);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
