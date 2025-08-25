import express from 'express';
import * as controller from '../controllers/products.controller.js';

const router = express.Router();
router.get('/', controller.getProduct);
router.get('/trending', controller.getTrendingProduct);
router.get('/new', controller.getNewProduct);
router.post('/', controller.createProduct);
router.patch('/:id', controller.updateProduct);
router.delete('/:id', controller.softDeleteProduct);
router.patch('/:id/restore', controller.restoreProduct);
router.delete('/:id/force', controller.forceDeleteProduct);
export const productRoute = router;
