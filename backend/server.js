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

// ===== CORS FIX - ĐẶT ĐẦU TIÊN =====
app.use((req, res, next) => {
  console.log(
    `[CORS] ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`
  );

  // Set headers cho TẤT CẢ responses
  res.header(
    'Access-Control-Allow-Origin',
    'https://sportswear-shop-web-1.onrender.com'
  );
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Preflight request handled');
    return res.status(200).end();
  }

  next();
});
// ===== END CORS FIX =====

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

mainRoute(app);

app.use((req, res) => {
  return res.status(404).send('404 Not found');
});

//update schema
// sequelize.sync({ alter: true });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
