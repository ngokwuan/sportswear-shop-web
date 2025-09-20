// routes/dashboard.route.js
import express from 'express';
import * as controller from '../controllers/dashboard.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const router = express.Router();

// Tất cả routes đều cần auth và quyền admin
router.use(checkUserJWT, checkUserPermission(['admin']));

// Lấy thống kê tổng quan
router.get('/stats', controller.getDashboardStats);

// Lấy đơn hàng gần đây
router.get('/recent-orders', controller.getRecentOrders);

// Lấy sản phẩm bán chạy
router.get('/top-products', controller.getTopProducts);

// Lấy dữ liệu biểu đồ
router.get('/chart-data', controller.getChartData);

// Lấy thống kê trạng thái đơn hàng
router.get('/order-status', controller.getOrderStatusStats);

// Lấy thống kê danh mục
router.get('/categories', controller.getCategoryStats);

export const dashboardRoute = router;
