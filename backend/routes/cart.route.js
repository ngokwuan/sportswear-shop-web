import express from 'express';
import * as controller from '../controllers/cart.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes cart
// router.use(checkUserJWT);
// router.use(checkUserPermission);

// Route thêm sản phẩm vào giỏ hàng
router.post('/add', controller.addToCart);

// Route lấy giỏ hàng
router.get('/', controller.getCart);

// Route cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update', controller.updateCartItem);

// Route xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:cart_id', controller.removeFromCart);

export const cartRouter = router;
