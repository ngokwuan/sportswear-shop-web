import express from 'express';
import * as controller from '../controllers/products.controller.js';

const router = express.Router();
router.get('/', controller.show);

export const productRoute = router;
