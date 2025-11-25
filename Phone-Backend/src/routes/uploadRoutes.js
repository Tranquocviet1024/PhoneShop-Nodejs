const express = require('express');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

const router = express.Router();

// All upload routes require authentication
router.use(authenticateToken);

/**
 * POST /upload
 * Upload image file
 * Returns: { filename, url, size, mimetype }
 */
router.post('/', upload.single('file'), handleUploadError, uploadImage);

/**
 * DELETE /upload/:filename
 * Delete uploaded image
 */
router.delete('/:filename', deleteImage);

module.exports = router;
