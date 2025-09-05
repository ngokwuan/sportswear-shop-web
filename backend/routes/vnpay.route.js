import express from 'express';
import * as controller from '../controllers/vnpay.controller.js';
const router = express.Router();

// Tạo URL thanh toán VNPay
router.post('/create-payment-url', controller.createPaymentUrl);

// Callback từ VNPay sau khi thanh toán
router.get('/return', controller.vnpayReturn);

// IPN (Instant Payment Notification) từ VNPay
router.get('/ipn', controller.vnpayIpn);

// Truy vấn kết quả giao dịch
router.post('/query', controller.queryTransaction);

// Hoàn tiền
router.post('/refund', controller.refund);

export const vnpayRoute = router;
