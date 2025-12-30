const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Tải biến môi trường từ file .env

const app = express();
const port = 3000;

// --- Cấu hình Gemini ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error(
    "Lỗi: Vui lòng thiết lập biến môi trường GEMINI_API_KEY trong file .env"
  );
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
// PHƯƠNG ÁN DỰ PHÒNG:
// Dùng một trong hai tên này. Tôi khuyến nghị "pro" cho OCR
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Cấu hình Multer (lưu file tạm) ---
// Chúng ta sẽ lưu file vào thư mục 'uploads'
const upload = multer({ dest: "uploads/" });

// --- Cung cấp file tĩnh (HTML, CSS, JS) ---
// Dùng express.static cho các file ở thư mục gốc
app.use(express.static(path.join(__dirname)));

// --- Hàm xử lý Gemini (từ ví dụ trước) ---
const prompt_text = `
Bạn là một trợ lý AI chuyên về trích xuất thông tin. Phân tích hình ảnh CCCD Việt Nam này.
Chỉ trích xuất các thông tin sau và trả về dưới dạng JSON:
* \`so_cccd\` (Số CCCD)
* \`ho_va_ten\` (Họ và tên)
* \`ngay_sinh\` (Ngày sinh, DD/MM/YYYY)
* \`gioi_tinh\` (Giới tính)
* \`quoc_tich\` (Quốc tịch)
* \`que_quan\` (Quê quán)
* \`noi_thuong_tru\` (Nơi thường trú)
* \`ngay_het_han\` (Ngày hết hạn)
Chỉ trả về duy nhất đối tượng JSON, không giải thích, không markdown.
`;

function fileToGenerativePart(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file ảnh tại: ${filePath}`);
  }
  const fileData = fs.readFileSync(filePath);
  const mimeType = "image/jpeg"; // Giả sử là JPEG, có thể cần logic để xác định

  return {
    inlineData: {
      data: fileData.toString("base64"),
      mimeType,
    },
  };
}

async function extractCccdInfo(imagePath) {
  try {
    const imagePart = fileToGenerativePart(imagePath);
    const result = await model.generateContent([prompt_text, imagePart]);
    const response = result.response;
    let text = response.text();

    // Làm sạch JSON (phòng trường hợp Gemini vẫn trả về markdown)
    text = text.replace(/```json\n?(.*?)\n?```/s, "$1").trim();

    return JSON.parse(text);
  } catch (e) {
    console.error("Lỗi khi gọi API Gemini hoặc phân tích JSON:", e);
    throw new Error("Không thể trích xuất thông tin từ ảnh.");
  }
}

// --- Định tuyến (Routes) ---

// 1. Route GET: Phục vụ trang UI (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Route POST: Xử lý ảnh tải lên
app.post("/upload", upload.single("cccdImage"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file nào được tải lên." });
  }

  const imagePath = req.file.path; // Đường dẫn đến file tạm

  try {
    console.log(`Đang xử lý file: ${imagePath}`);
    const data = await extractCccdInfo(imagePath);

    // Trả kết quả JSON về cho frontend
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    // RẤT QUAN TRỌNG: Xóa file tạm sau khi xử lý xong
    // Đây là thông tin nhạy cảm, không nên lưu giữ
    try {
      fs.unlinkSync(imagePath);
      console.log(`Đã xóa file tạm: ${imagePath}`);
    } catch (e) {
      console.error(`Không thể xóa file tạm: ${imagePath}`, e);
    }
  }
});

// --- Khởi động máy chủ ---
app.listen(port, () => {
  console.log(`Máy chủ đang chạy tại http://localhost:${port}`);
});
