import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import { mainRoute } from './routes/index.route.js';
import * as db from './config/database.js';
import cookieParser from 'cookie-parser';

// Connect db
db.connectDB();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed origins cho CORS
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
  ];

  // Production origins
  if (process.env.NODE_ENV === 'production') {
    // Thêm domain frontend của bạn
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    // Hoặc hardcode nếu biết trước
    origins.push('https://your-frontend-app.netlify.app');
    origins.push('https://your-frontend-app.vercel.app');
  }

  return origins;
};

// CORS configuration
app.use(
  cors({
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Debug middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path}`);
    console.log('Origin:', req.headers.origin);
    console.log('Cookies:', Object.keys(req.cookies || {}));
  }
  next();
});

// API Routes
mainRoute(app);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: '404 API endpoint not found' });
});

app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins:`, getAllowedOrigins());
});
