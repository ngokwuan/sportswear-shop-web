import express from 'express';
import * as controller from '../controllers/products.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';
import { uploadProductImages } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', controller.getProduct);
router.get('/brands', controller.getBrandProduct);
router.get('/price', controller.getPriceProduct);
router.get('/size', controller.getSizeProduct);
router.get('/trending', controller.getTrendingProduct);
router.get('/new', controller.getNewProduct);
router.get('/trash', controller.getProductTrash);
router.get('/:id', controller.getProductById);

// Protected routes (Admin only)
router.use(checkUserJWT, checkUserPermission(['admin']));

router.post('/', uploadProductImages, controller.createProduct);
router.patch('/:id', uploadProductImages, controller.updateProduct);
router.delete('/:id', controller.softDeleteProduct);
router.patch('/:id/restore', controller.restoreProduct);
router.delete('/:id/force', controller.forceDeleteProduct);

export const productRoute = router;
