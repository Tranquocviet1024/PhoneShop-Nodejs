const { ApiResponse, ApiError } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');
const { sanitizeFilePath, safeDeleteFile } = require('../utils/securityUtils');

/**
 * POST /api/upload
 * Upload image file and return file URL
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded'));
    }

    // Validate multer file object
    if (!req.file.filename || typeof req.file.filename !== 'string' || 
        req.file.filename.includes('..') || req.file.filename.includes('/') || 
        req.file.filename.includes('\\')) {
      return next(new ApiError(400, 'Invalid file upload'));
    }

    // Generate file URL - use BASE_URL env var for production, or construct from request
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      // Fallback: construct from request (works for local development)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      baseUrl = `${protocol}://${host}`;
    }
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json(
      new ApiResponse(200, {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }, 'Image uploaded successfully')
    );
  } catch (error) {
    // Delete file if error occurs
    if (req.file && req.file.filename && typeof req.file.filename === 'string' &&
        !req.file.filename.includes('..') && !req.file.filename.includes('/') && 
        !req.file.filename.includes('\\')) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      safeDeleteFile(req.file.filename, uploadsDir);
    }
    next(error);
  }
};

/**
 * DELETE /api/upload/:filename
 * Delete uploaded image file
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Sanitize and validate file path
    const uploadsDir = path.join(__dirname, '../../uploads');
    const sanitizedPath = sanitizeFilePath(filename, uploadsDir);

    if (!sanitizedPath) {
      return next(new ApiError(400, 'Invalid filename'));
    }

    // Check if file exists
    if (!fs.existsSync(sanitizedPath)) {
      return next(new ApiError(404, 'File not found'));
    }

    // Verify it's a file, not directory
    const stats = fs.statSync(sanitizedPath);
    if (!stats.isFile()) {
      return next(new ApiError(400, 'Invalid file'));
    }

    // Delete file safely
    fs.unlinkSync(sanitizedPath);

    res.status(200).json(
      new ApiResponse(200, null, 'Image deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
