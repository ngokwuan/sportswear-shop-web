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

// Connect db
db.connectDB();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS chỉ cần cho development
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    })
  );
}

// Config cookie-parser (đơn giản hóa)
app.use(cookieParser());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes với prefix /api
app.use('/api', mainRoute);

// Serve static files from React build trong production
if (process.env.NODE_ENV === 'production') {
  // Serve static files từ frontend/dist
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Catch all handler cho React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Development: serve public files
  app.use(express.static(path.join(__dirname, '../frontend/public')));

  app.use((req, res) => {
    return res
      .status(404)
      .send('404 Not found - API should be prefixed with /api');
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'Serving React app from:',
      path.join(__dirname, '../frontend/dist')
    );
  }
});
