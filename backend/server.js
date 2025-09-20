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

// Cấu hình CORS
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'https://sportswear-shop-web-1.onrender.com',
//     ], // Các port frontend có thể chạy
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//     credentials: true,
//   })
// );

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sportswear-shop-web-1.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie',
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Một số legacy browsers (IE11, các phiên bản cũ) sẽ gặp sự cố với 204
    preflightContinue: false,
  })
);

// Explicitly handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,PATCH,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
//config cookie-parser
app.use(cookieParser());

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

mainRoute(app);
app.use((req, res) => {
  return res.send('404 Not found');
});
//update schema
// sequelize.sync({ alter: true });
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
