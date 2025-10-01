import express from 'express';
import * as controller from '../controllers/products.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const router = express.Router();
router.get('/', controller.getProduct);
router.get('/brands', controller.getBrandProduct);
router.get('/price', controller.getPriceProduct);
router.get('/size', controller.getSizeProduct);
router.get('/trending', controller.getTrendingProduct);
router.get('/new', controller.getNewProduct);
router.get('/trash', controller.getProductTrash);
router.get('/:id', controller.getProductById);

router.use(checkUserJWT, checkUserPermission(['admin']));

router.post('/', controller.createProduct);

router.patch('/:id', controller.updateProduct);
router.delete('/:id', controller.softDeleteProduct);
router.patch('/:id/restore', controller.restoreProduct);
router.delete('/:id/force', controller.forceDeleteProduct);

export const productRoute = router;
