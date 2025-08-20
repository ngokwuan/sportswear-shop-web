import express from 'express';
import * as controller from '../controllers/users.controller.js';

const router = express.Router();
router.get('/', controller.show);

export const userRoute = router;
