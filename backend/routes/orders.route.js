import express from 'express';
import * as controller from '../controllers/order.controller.js';

const router = express.Router();

router.post('/create', controller.createOrder);
router.get('/user/:user_id', controller.getUserOrders);
router.get('/:order_id', controller.getOrderById);
router.patch('/:order_id/payment-status', controller.updatePaymentStatus);
router.patch('/:order_id/status', controller.updateOrderStatus);
router.post('/:order_id/cancel', controller.cancelOrder);
router.get('/', controller.getAllOrders);

export const orderRoute = router;
