const { ApiResponse, ApiError } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/upload
 * Upload image file and return file URL
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded'));
    }

    // Generate file URL
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

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
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
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

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return next(new ApiError(400, 'Invalid filename'));
    }

    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new ApiError(404, 'File not found'));
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json(
      new ApiResponse(200, null, 'Image deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
