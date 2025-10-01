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

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
});

db.connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sportswear-shop-web.vercel.app',
      'https://sportswear-shop-web.onrender.com',
    ];

// CORS middleware with special handling for VNPay IPN
app.use((req, res, next) => {
  // Allow VNPay IPN/return requests without CORS restrictions
  if (
    req.path.includes('/payment/vnpay/ipn') ||
    req.path.includes('/payment/vnpay/return')
  ) {
    return next();
  }

  // Apply CORS for other routes
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })(req, res, next);
});

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(methodOverride('_method'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

mainRoute(app);

app.use((req, res) => {
  return res.status(404).json({ error: '404 Not found' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
