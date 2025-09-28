import express from 'express';
import * as controller from '../controllers/dashboard.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const router = express.Router();

router.use(checkUserJWT, checkUserPermission(['admin']));
router.get('/stats', controller.getDashboardStats);
router.get('/recent-orders', controller.getRecentOrders);
router.get('/top-products', controller.getTopProducts);
router.get('/chart-data', controller.getChartData);
router.get('/order-status', controller.getOrderStatusStats);
router.get('/categories', controller.getCategoryStats);

export const dashboardRoute = router;
