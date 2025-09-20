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

//Connect db
db.connectDB();

const app = express();
const port = process.env.PORT || 3000;

// MANUAL CORS MIDDLEWARE - ĐẶT ĐẦU TIÊN TRƯỚC TẤT CẢ
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('=== CORS DEBUG ===');
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Origin:', origin);
  console.log('User-Agent:', req.headers['user-agent']);

  // Danh sách origins được phép
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sportswear-shop-web-1.onrender.com', // frontend
    'https://sportswear-shop-web.onrender.com', // nếu cần
  ];

  // Luôn set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✓ Origin allowed:', origin);
  } else if (!origin) {
    // Cho phép requests không có origin (Postman, mobile apps)
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('✓ No origin - allowing all');
  } else {
    console.log('✗ Origin not allowed:', origin);
  }

  // Set tất cả CORS headers cần thiết
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cookie,Cache-Control'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('✓ Handling OPTIONS preflight request');
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }

  console.log('=== END CORS DEBUG ===\n');
  next();
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sportswear-shop-web-1.onrender.com', // frontend
  'https://sportswear-shop-web.onrender.com', // nếu cần
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions)); // đặt trước app.use(express.json()) và trước routes

// nếu vẫn muốn giữ debug logs, có thể log origin trước cors
app.use((req, res, next) => {
  console.log('CORS origin:', req.headers.origin);
  next();
});

//config cookie-parser
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Xử lý middleware từ form
app.use(express.urlencoded({ extended: true }));

// Xử lý dữ liệu gửi lên dạng JSON
app.use(express.json());

// Middleware override lại phương thức gửi lên
app.use(methodOverride('_method'));

// Routes
mainRoute(app);

// 404 handler
app.use((req, res) => {
  return res.status(404).send('404 Not found');
});

//update schema
// sequelize.sync({ alter: true });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
