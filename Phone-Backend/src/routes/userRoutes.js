const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.post('/change-password', authenticateToken, userController.changePassword);
router.post('/deactivate', authenticateToken, userController.deactivateAccount);

// Admin routes
router.get('/all', authenticateToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeRole('admin'), userController.getUserById);
router.put('/:id/role', authenticateToken, authorizeRole('admin'), userController.updateUserRole);

module.exports = router;
