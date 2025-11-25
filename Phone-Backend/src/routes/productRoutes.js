const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Categories
router.get('/category/all', productController.getAllCategories);

// Admin routes - Sử dụng permission middleware
router.post('/', authenticateToken, requirePermission('create_product'), productController.createProduct);
router.put('/:id', authenticateToken, requirePermission('update_product'), productController.updateProduct);
router.delete('/:id', authenticateToken, requirePermission('delete_product'), productController.deleteProduct);

module.exports = router;
