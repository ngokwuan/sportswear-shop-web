import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import { mainRoute } from './routes/index.route.js';
import * as db from './config/database.js';
import cookieParser from 'cookie-parser';
import sequelize from './config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

//Connect db
db.connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Parse cookies FIRST - trước tất cả middleware khác
app.use(cookieParser());

// Get allowed origins from environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sportswear-shop-web.netlify.app',
      'https://sportswear-shop-web.onrender.com',
    ];

// Cấu hình CORS với credentials
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // Quan trọng: cho phép cookies
    optionsSuccessStatus: 200, // Hỗ trợ legacy browsers
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Debug middleware - chỉ trong development hoặc khi cần debug
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_COOKIES) {
  app.use((req, res, next) => {
    console.log('🍪 Cookies received:', req.cookies);
    console.log('🌐 Origin:', req.headers.origin);
    console.log('📍 Request:', req.method, req.path);
    console.log('🔐 Authorization header:', req.headers.authorization);
    next();
  });

  // Log response headers
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log('📤 Response Status:', res.statusCode);
      console.log('🍪 Set-Cookie:', res.get('Set-Cookie'));
      console.log('🌐 CORS Headers:', {
        'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Credentials': res.get(
          'Access-Control-Allow-Credentials'
        ),
      });
    });
    next();
  });
}

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Xử lý middleware từ form
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Xử lý dữ liệu gửi lên dạng JSON
app.use(express.json());

// Middleware override lại phương thức gửi lên
app.use(methodOverride('_method'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Main routes
mainRoute(app);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: '404 Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

// Update schema in development only
if (process.env.NODE_ENV === 'development') {
  // sequelize.sync({ alter: true });
}

app.listen(port, () => {
  console.log(`🚀 App listening at http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(
    `🍪 Cookie settings: secure=${process.env.COOKIE_SECURE}, sameSite=${process.env.COOKIE_SAME_SITE}`
  );
});
