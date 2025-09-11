import express from 'express';
import * as controller from '../controllers/cart.controller.js';
import { checkUserJWT } from '../middleware/JWTActions.js';
import { optionalUserJWT } from '../middleware/JWTActions.js';
const router = express.Router();

router.get('/count', optionalUserJWT, controller.getCountCart);

router.use(checkUserJWT);

router.get('/', controller.getCart);
router.post('/add', controller.addToCart);
router.patch('/update', controller.updateCartItem);
router.delete('/remove/:cart_id', controller.removeFromCart);
router.delete('/clear', controller.clearCart);
export const cartRoute = router;
