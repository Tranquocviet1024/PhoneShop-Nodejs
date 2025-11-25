const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { handleValidationErrors } = require('../utils/validationUtils');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Sign Up
router.post(
  '/signup',
  [
    body('username', 'Username must be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('fullName', 'Full name is required').notEmpty(),
  ],
  handleValidationErrors,
  authController.signup
);

// Sign In
router.post(
  '/signin',
  [
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password is required').notEmpty(),
  ],
  handleValidationErrors,
  authController.signin
);

// Verify Token
router.post('/verify', authController.verifyToken);

// Refresh Access Token
router.post(
  '/refresh',
  [body('refreshToken', 'Refresh token is required').notEmpty()],
  handleValidationErrors,
  authController.refreshAccessToken
);

// Check Permission
router.post('/check-permission', authenticateToken, authController.checkPermission);

// Check Role
router.post('/check-role', authenticateToken, authController.checkRole);

// Request Password Reset
router.post(
  '/request-password-reset',
  [body('email', 'Please provide a valid email').isEmail()],
  handleValidationErrors,
  authController.requestPasswordReset
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('token', 'Reset token is required').notEmpty(),
    body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  handleValidationErrors,
  authController.resetPassword
);

module.exports = router;
