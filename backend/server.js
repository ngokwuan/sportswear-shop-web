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

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sportswear-shop-web.netlify.app',

    'https://sportswear-shop-web.onrender.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'Set-Cookie',
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Additional manual CORS headers (backup)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Request from origin:', origin, 'to:', req.url);

  // Nếu origin trong danh sách cho phép
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sportswear-shop-web.netlify.app',
    'https://sportswear-shop-web.onrender.com',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cookie'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  // Log để debug
  console.log('CORS headers set for:', req.method, req.url);

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
