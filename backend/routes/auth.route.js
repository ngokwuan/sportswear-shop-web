import express from 'express';
import * as controller from '../controllers/auth.controller.js';
import { createUsers } from '../controllers/users.controller.js';
import { checkUserJWT } from '../middleware/JWTActions.js';

const router = express.Router();
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/register', createUsers);
router.get('/me', checkUserJWT, controller.me);
export const authRoute = router;
