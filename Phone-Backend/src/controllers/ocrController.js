const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { sanitizeFilePath, safeDeleteFile, safeReadFile } = require('../utils/securityUtils');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const UPLOADS_DIR = path.join(__dirname, '../../uploads/cccd');

/**
 * Extract CCCD information from uploaded image using Gemini AI
 */
exports.extractCCCDInfo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No image file uploaded'));
    }

    // Validate and sanitize file path
    const sanitizedPath = sanitizeFilePath(req.file.filename, UPLOADS_DIR);

    if (!sanitizedPath) {
      return next(new ApiError(400, 'Invalid file path'));
    }
    
    // Read image file safely
    const imageData = safeReadFile(req.file.filename, UPLOADS_DIR);
    
    if (!imageData) {
      return next(new ApiError(400, 'Failed to read image file'));
    }
    
    const base64Image = imageData.toString('base64');

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create prompt for CCCD extraction
    const prompt = `Hãy trích xuất thông tin từ ảnh Căn cước công dân Việt Nam này và trả về JSON với các trường sau:
    - id: Số CCCD (12 chữ số)
    - name: Họ và tên (viết hoa toàn bộ)
    - dob: Ngày sinh (định dạng DD/MM/YYYY)
    - sex: Giới tính (Nam hoặc Nữ)
    - nationality: Quốc tịch (thường là "Việt Nam")
    - origin: Quê quán (Tỉnh/Thành phố)
    - residence: Nơi thường trú (địa chỉ đầy đủ)
    - expiry: Ngày hết hạn (định dạng DD/MM/YYYY)
    
    Chỉ trả về JSON thuần túy, không có markdown formatting hay text giải thích.
    Nếu không đọc được trường nào, để giá trị rỗng "".`;

    // Call Gemini API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON response
    const cccdInfo = JSON.parse(text);

    // Cleanup uploaded file after processing
    safeDeleteFile(req.file.filename, UPLOADS_DIR);

    return res.status(200).json(
      new ApiResponse(200, cccdInfo, 'CCCD information extracted successfully')
    );
  } catch (error) {
    // Cleanup file on error
    if (req.file && req.file.filename) {
      safeDeleteFile(req.file.filename, UPLOADS_DIR);
    }
    
    console.error('OCR Error:', error);
    return next(
      new ApiError(
        500, 
        'Failed to extract CCCD information. Please ensure the image is clear and contains a valid Vietnamese ID card.',
        [error.message]
      )
    );
  }
};
