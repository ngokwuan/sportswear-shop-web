import express from 'express';
import * as controller from '../controllers/users.controller.js';

const router = express.Router();
router.get('/', controller.show);
router.post('/create', controller.create);

export const userRoute = router;
