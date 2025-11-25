const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/authorizationMiddleware');
const PermissionEnum = require('../enums/PermissionEnum');

// Non-parameterized routes first (must be before /:id)
router.get('/enum/values', categoryController.getCategoryEnumValues);

// GET all categories
router.get('/', categoryController.getAllCategories);

// Create category (ADMIN ONLY)
router.post(
  '/',
  authenticateToken,
  authorizePermission([PermissionEnum.MANAGE_CATEGORIES]),
  categoryController.createCategory
);

// Parameterized routes (/:id) last
// GET single category
router.get('/:id', categoryController.getCategoryById);

// Update category (ADMIN ONLY)
router.put(
  '/:id',
  authenticateToken,
  authorizePermission([PermissionEnum.MANAGE_CATEGORIES]),
  categoryController.updateCategory
);

// Delete category (ADMIN ONLY)
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission([PermissionEnum.MANAGE_CATEGORIES]),
  categoryController.deleteCategory
);

module.exports = router;

module.exports = router;
