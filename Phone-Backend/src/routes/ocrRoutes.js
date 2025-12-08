const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/authMiddleware');
const ocrController = require('../controllers/ocrController');

// Ensure uploads/cccd directory exists
const cccdDir = path.join(__dirname, '../../uploads/cccd');
if (!fs.existsSync(cccdDir)) {
  fs.mkdirSync(cccdDir, { recursive: true });
}

// Configure multer for CCCD image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cccd/');
  },
  filename: function (req, file, cb) {
    // Generate cryptographically secure unique filename
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const uniqueSuffix = `${timestamp}-${randomBytes}`;
    cb(null, 'cccd-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg image formats are allowed!'));
    }
  }
});

/**
 * @route   POST /api/ocr/extract-cccd
 * @desc    Extract information from Vietnamese ID card image
 * @access  Public (no authentication required - used during registration)
 */
router.post('/extract-cccd', upload.single('image'), ocrController.extractCCCDInfo);

module.exports = router;
