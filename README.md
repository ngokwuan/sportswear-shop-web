# Sportswear Shop

Ứng dụng thương mại điện tử hiện đại cho cửa hàng thể thao với đầy đủ tính năng frontend và backend

**Live Demo:**

- Frontend: https://sportswear-shop-mx3gyjq93-ngokwuans-projects.vercel.app/
- Backend API: https://sportswear-shop-web.onrender.com

## Tổng quan

Sportswear Shop là một ứng dụng e-commerce toàn diện được xây dựng với công nghệ hiện đại, tích hợp thanh toán VNPay và hệ thống quản lý hoàn chỉnh.

### Công nghệ sử dụng

**Frontend:**

- React 19 + Vite
- Redux Toolkit cho state management
- React Router DOM v7 cho routing
- Axios cho HTTP requests
- SASS cho styling
- FontAwesome icons
- React Toastify cho notifications

**Backend:**

- Node.js + Express.js (ES Modules)
- Sequelize ORM với MySQL
- JWT Authentication với Cookie-based sessions
- VNPay Payment Gateway
- CORS với multiple origins support
- Morgan logging, Helmet security

**Database:**

- MySQL (Aiven Cloud Database)

**Deployment:**

- Frontend: Netlify
- Backend: Render.com
- Database: Aiven Cloud

## Tính năng chính

### Người dùng

- Đăng ký / Đăng nhập với JWT
- Giỏ hàng thông minh
- Giao diện responsive
- Tìm kiếm và lọc sản phẩm
- Theo dõi đơn hàng
- Đặt hàng và thanh toán với vnpay
- Profile management

### Thanh toán

- Tích hợp VNPay Sandbox
- Xử lý thanh toán an toàn
- Xác nhận đơn hàng tự động
- Multiple payment return URLs

### Quản trị

- Dashboard quản lý
- Quản lý sản phẩm, đơn hàng
- Quản lý người dùng
- Báo cáo thống kê

### Khác

- Hệ thống blog
- Danh mục sản phẩm
- Phân quyền chi tiết
- SEO friendly URLs với slugify
- Rate limiting
- File upload với Multer

## Cấu trúc dự án

```
sportswear-shop/
├── backend/
│   ├── config/              # Sequelize database config
│   ├── controllers/         # Logic xử lý request
│   ├── middleware/          # JWT, CORS, validation
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── services/            # VNPay, email services
│   ├── seed/                # Dữ liệu mẫu
│   ├── uploads/             # File upload directory
│   ├── utils/               # Helper functions
│   ├── .env.development     # Development environment
│   ├── .env.production      # Production environment
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # React components
│   │   ├── pages/           # Các trang chính
│   │   ├── context/         # UserContext
│   │   ├── config/          # Frontend configuration
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Layout components
│   │   ├── routes/          # Route configuration
│   │   ├── services/        # API calls
│   │   ├── setup/           # App setup
│   │   ├── styles/          # SASS stylesheets
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static files
│   ├── .env.development     # Development API URL
│   ├── .env.production      # Production API URL
│   └── package.json
└── README.md
```

## Yêu cầu hệ thống

- **Node.js:** phiên bản 16.0 trở lên
- **npm:** phiên bản 8.0 trở lên
- **MySQL:** 8.0+ (local) hoặc cloud database
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+

## Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/your-username/sportswear-shop.git
cd sportswear-shop
```

### 2. Cài đặt dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 3. Cấu hình biến môi trường

**Backend (.env.development):**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sportswear_shop
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h

# VNPay Configuration (Sandbox)
VNP_TMN_CODE=your_vnp_tmn_code
VNP_HASH_SECRET=your_vnp_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=http://localhost:3000/payment/vnpay/return
FRONTEND_URL_RS=http://localhost:5173/payment-result

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Cookie Configuration
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_HTTP_ONLY=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Backend (.env.production):**

```env
# Database Configuration (Aiven Cloud)
DB_HOST=your_aiven_host
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=sportswear_shop
DB_PORT=26045

# JWT Configuration
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d

# VNPay Configuration
VNP_TMN_CODE=your_vnp_tmn_code
VNP_HASH_SECRET=your_vnp_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=https://sportswear-shop-web.onrender.com/payment/vnpay/return
FRONTEND_URL_RS=https://sportswear-shop-mx3gyjq93-ngokwuans-projects.vercel.app//payment-result

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://sportswear-shop-mx3gyjq93-ngokwuans-projects.vercel.app/

# Cookie Configuration for Production
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_HTTP_ONLY=true

# CORS Configuration
ALLOWED_ORIGINS=https://sportswear-shop-mx3gyjq93-ngokwuans-projects.vercel.app/,https://sportswear-shop-web.onrender.com
```

**Frontend (.env.development):**

```env
VITE_API_URL=http://localhost:3000
```

**Frontend (.env.production):**

```env
VITE_API_URL=https://sportswear-shop-web.onrender.com
```

### 4. Khởi tạo database

```bash
cd backend
# Tạo database và tables (nếu sử dụng migration)
npm run migrate

# Seed dữ liệu mẫu
npm run seed
```

### 5. Chạy ứng dụng

**Development mode:**

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

**Production mode:**

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## Truy cập ứng dụng

- **Frontend:** http://localhost:5173 (development)
- **Backend API:** http://localhost:3000 (development)
- **Health Check:** http://localhost:3000/health

## Scripts có sẵn

### Backend

```bash
npm run dev          # Development với nodemon + cross-env
npm start            # Production mode
npm run seed         # Seed dữ liệu sản phẩm mẫu
```

### Frontend

```bash
npm run dev          # Development server (Vite)
npm run build        # Build production với mode
npm run preview      # Preview production build
npm run lint         # ESLint check
```

## Deployment

### Backend (Render.com)

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables từ `.env.production`
5. Enable auto-deploy from main branch

### Frontend (Netlify)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Configure redirects cho React Router

### Database (Aiven Cloud)

- MySQL service đã được setup
- Connection details trong `.env.production`
- Backup và monitoring tự động

## API Endpoints

**Authentication:**

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

**Products:**

- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

**Orders:**

- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng

**Payment:**

- `POST /api/payment/vnpay/create` - Tạo payment URL
- `GET /api/payment/vnpay/return` - VNPay return URL
- `POST /api/payment/vnpay/ipn` - VNPay IPN webhook

## Bảo mật

- **JWT Authentication** với HTTP-only cookies
- **CORS** configuration cho multiple origins
- **Helmet** cho security headers
- **Rate limiting** cho API endpoints
- **Input validation** với express-validator
- **Password hashing** với bcryptjs
- **Secure cookies** trong production

## Testing

```bash
# Backend tests (nếu có)
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Lint check
npm run lint
```

## Troubleshooting

### CORS Issues

- Kiểm tra `ALLOWED_ORIGINS` trong `.env`
- Đảm bảo frontend URL được include

### Database Connection

- Verify connection details trong `.env`
- Check firewall/network connectivity
- Aiven dashboard để monitor connections

### VNPay Integration

- Kiểm tra TMN_CODE và HASH_SECRET
- Verify return URLs có đúng domain
- Check sandbox vs production URLs

## Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

Dự án này được phân phối dưới MIT License. Xem `LICENSE` để biết thêm thông tin.

## Tác giả

- **Your Name** - _Initial work_ - [GitHub](https://github.com/your-username)

## Lời cảm ơn

- VNPay cho hệ thống thanh toán
- React team cho framework tuyệt vời
- Aiven cho cloud database service
- Netlify và Render cho hosting
- Tất cả contributors

## Báo lỗi

Nếu bạn phát hiện lỗi, vui lòng tạo issue tại [GitHub Issues](https://github.com/your-username/sportswear-shop/issues)

## Liên hệ

- Email: your.email@example.com
- LinkedIn: [Your Profile](https://linkedin.com/in/your-profile)
- Website: [your-website.com](https://your-website.com)

---

Nếu dự án này hữu ích, hãy cho chúng tôi một star nhé!
