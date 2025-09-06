import express from 'express';
import * as controller from '../controllers/cart.controller.js';
const router = express.Router();

router.get('/', controller.getCart);
router.get('/count', controller.getCountCart);
router.post('/add', controller.addToCart);
router.patch('/update', controller.updateCartItem);
router.delete('/remove/:cart_id', controller.removeFromCart);
router.delete('/clear', controller.clearCart);
export const cartRoute = router;
