import express from 'express';
import * as controller from '../controllers/categories.controller.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';
const router = express.Router();
router.get('/', controller.getCategories);

router.use(checkUserJWT, checkUserPermission(['admin']));

router.get('/trash', controller.getCategoriesTrash);
router.post('/', controller.createCategories);
router.patch('/:id', controller.updateCategories);
router.delete('/:id', controller.softDeleteCategories);
router.patch('/:id/restore', controller.restoreCategories);
router.delete('/:id/force', controller.forceDeleteCategories);

export const categoriesRoute = router;
