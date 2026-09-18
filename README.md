# Sportswear Shop

Ứng dụng thương mại điện tử cho cửa hàng thể thao — React + Node.js + MySQL.

**Live Demo:** [Frontend](https://sportswear-shop-web.vercel.app) · [Backend API](https://sportswear-shop-web.onrender.com)

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, Vite, Redux Toolkit, React Router v7, SASS |
| Backend | Node.js, Express.js, Sequelize ORM, JWT, VNPay |
| Database | MySQL — Aiven Cloud |
| DevOps | Docker, Docker Compose, Nginx |
| Hosting | Vercel (FE) · Render.com (BE) · Aiven (DB) |

---

## Tính năng

- Đăng ký / đăng nhập JWT, phân quyền User/Admin
- Giỏ hàng, đặt hàng, theo dõi đơn hàng
- Thanh toán VNPay Sandbox
- Quản lý sản phẩm, đơn hàng, người dùng (Admin)
- Upload ảnh với Cloudinary
- Blog, danh mục, tìm kiếm & lọc sản phẩm

---

## Cài đặt

### 1. Clone

```bash
git clone https://github.com/ngokwuan/sportswear-shop.git
cd sportswear-shop
```

### 2. Biến môi trường

```bash
cp .env.example backend/.env
# Điền thông tin thực tế vào backend/.env
```

> Xem [`.env.example`](./.env.example) để biết danh sách đầy đủ các biến.

---

## Chạy ứng dụng

### Docker (khuyến nghị)

> Yêu cầu Docker Desktop đang chạy

```bash
# Development — hot-reload
docker compose -f docker-compose.dev.yml up --build

# Production — Nginx serve
docker compose up -d --build
```

| Mode | Frontend | Backend |
|------|----------|---------|
| Dev | http://localhost:5173 | http://localhost:3000 |
| Prod | http://localhost | http://localhost:3000 |

### npm (truyền thống)

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## Deployment

| Service | Platform | Cấu hình |
|---------|----------|----------|
| Backend | Render.com | Build: `npm install` · Start: `npm start` |
| Frontend | Vercel | Root: `frontend` · Preset: Vite |
| Database | Aiven Cloud | Connection string trong `backend/.env` |

---

## API chính

```
POST   /api/auth/register          Đăng ký
POST   /api/auth/login             Đăng nhập
GET    /api/products               Danh sách sản phẩm
POST   /api/orders                 Tạo đơn hàng
POST   /api/payment/vnpay/create   Tạo URL thanh toán
GET    /health                     Health check
```

---

## Cấu trúc dự án

```
sportswear-shop/
├── docker-compose.yml       # Production
├── docker-compose.dev.yml   # Development
├── .env.example             # Template biến môi trường
├── backend/
│   ├── config/              # DB config
│   ├── controllers/         # Request handlers
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── services/            # VNPay, Cloudinary
│   ├── middleware/          # Auth, validation
│   ├── Dockerfile
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Các trang
    │   ├── services/        # API calls
    │   └── styles/          # SASS
    ├── Dockerfile           # Nginx production
    ├── Dockerfile.dev       # Vite dev server
    └── nginx.conf
```

---

Nếu dự án này hữu ích, hãy cho một ⭐ nhé!
