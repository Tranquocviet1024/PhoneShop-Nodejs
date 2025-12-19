require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database connection
const { connectDB } = require('./src/config/database');

// Import database seeding
const { seedDatabase } = require('./src/config/seedDatabase');

// Import routes
const apiRoutes = require('./src/routes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Database will be connected in the startup function
let dbConnected = false;

// Middleware

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin for static files
}));

// CORS configuration for production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads folder) - CORS is already applied globally
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: false
}));

// Rate limiting - Cấu hình hợp lý cho ứng dụng web
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 200, // 200 requests mỗi phút cho mỗi IP (đủ cho việc duyệt web bình thường)
  message: { 
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 phút.' 
  },
  standardHeaders: true, // Trả về rate limit info trong headers
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  // Không limit các request đến static files
  skip: (req) => req.path.startsWith('/uploads'),
});

// Rate limit chặt hơn cho auth (chống brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // 20 lần thử đăng nhập mỗi 15 phút
  message: { 
    success: false,
    message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit cho API nhạy cảm (tạo đơn hàng, thanh toán)
const sensitiveApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 30, // 30 requests mỗi phút
  message: { 
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' 
  },
});

app.use('/api/', limiter);
app.use('/api/auth/signin', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/orders', sensitiveApiLimiter);
app.use('/api/payments', sensitiveApiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Startup function - ensures proper initialization order
const startServer = async () => {
  try {
    // 1. Connect to database and sync models (creates tables if not exist)
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    // 2. Start HTTP server
    app.listen(PORT, HOST, async () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log(`🌐 CORS Origins: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);

      // 3. Run database seeding (after tables are created)
      try {
        await seedDatabase();
        console.log('✅ Database seeding completed');
      } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        // Don't exit - server can still run without seed data
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;
