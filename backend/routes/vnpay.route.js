import express from 'express';
import * as controller from '../controllers/vnpay.controller.js';
import { checkUserJWT } from '../middleware/JWTActions.js';

const router = express.Router();

router.get('/return', controller.vnpayReturnRedirect);
router.post('/ipn', controller.vnpayIpn);

router.use(checkUserJWT);
router.post('/create-payment-url', controller.createPaymentUrl);
router.post('/query', controller.queryTransaction);
router.post('/refund', controller.refund);

export const vnpayRoute = router;
