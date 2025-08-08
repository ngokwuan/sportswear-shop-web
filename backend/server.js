import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import { mainRoute } from './routes/index.route.js';
import * as db from './config/database.js';
import { createJWT, verifyToken } from './middleware/JWTActions.js';

//Connect db
db.connectDB();

//test jwt
createJWT();
let decoded = verifyToken(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicXVhbiIsImFkZHJlc3MiOiJiaW5oIGRpbmgiLCJpYXQiOjE3NTQ1NTM5ODF9._WWJOQqOwAeTsz6XMezq8xipmH5oeKmSyJJTI1VsLhM'
);

console.log(decoded);

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Các port frontend có thể chạy
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Đảm bảo đường dẫn static đúng
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

// HTTP logger
// app.use(morgan('combined'));

// Route init
mainRoute(app);

// 127.0.0.1 - localhost
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
