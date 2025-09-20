import express from 'express';
import * as controller from '../controllers/users.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const router = express.Router();

router.use(checkUserJWT, checkUserPermission(['admin']));

router.get('/', controller.getUsers);
router.get('/trash', controller.getUserTrash);
router.post('/', controller.createUsers);
router.patch('/:id', controller.updateUsers);
router.delete('/:id', controller.softDeleteUsers);
router.patch('/:id/restore', controller.restoreUsers);
router.delete('/:id/force', controller.forceDeleteUsers);
export const userRoute = router;
