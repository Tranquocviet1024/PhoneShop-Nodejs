const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

/**
 * GET /profile
 * Get current user's profile
 */
router.get('/', getProfile);

/**
 * PUT /profile
 * Update current user's profile
 */
router.put('/', updateProfile);

module.exports = router;
