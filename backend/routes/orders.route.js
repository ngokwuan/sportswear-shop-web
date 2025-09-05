import express from 'express';
import * as controller from '../controllers/order.controller.js';

const router = express.Router();

// Tạo đơn hàng mới
router.post('/create', controller.createOrder);

// Lấy danh sách đơn hàng của user
router.get('/user/:user_id', controller.getUserOrders);

// Lấy chi tiết đơn hàng
router.get('/:order_id', controller.getOrderById);

// Cập nhật trạng thái thanh toán
router.patch('/:order_id/payment-status', controller.updatePaymentStatus);

// Cập nhật trạng thái đơn hàng
router.patch('/:order_id/status', controller.updateOrderStatus);

// Hủy đơn hàng
router.post('/:order_id/cancel', controller.cancelOrder);

// Lấy tất cả đơn hàng (admin)
router.get('/', controller.getAllOrders);

export const orderRoute = router;
