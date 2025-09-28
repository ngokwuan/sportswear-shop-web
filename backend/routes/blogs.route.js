import express from 'express';
import * as controller from '../controllers/blogs.controller.js';
import { checkUserJWT } from '../middleware/JWTActions.js';

const router = express.Router();

router.get('/published', controller.getPublishedBlogs);
router.get('/:id/public', controller.getBlogById);

router.get('/trash', checkUserJWT, controller.getTrashedBlogs);
router.get('/', checkUserJWT, controller.getAllBlogs);
router.post('/', checkUserJWT, controller.createBlog);
router.get('/:id', checkUserJWT, controller.getBlogById);
router.patch('/:id', checkUserJWT, controller.updateBlog);
router.delete('/:id', checkUserJWT, controller.deleteBlog);
router.post('/:id/restore', checkUserJWT, controller.restoreBlog);
router.delete('/:id/force', checkUserJWT, controller.forceDeleteBlog);

export const blogRoute = router;
