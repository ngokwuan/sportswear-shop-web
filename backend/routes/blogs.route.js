// routes/blogs.route.js
import express from 'express';
import * as controller from '../controllers/blogs.controller.js';
import { checkUserJWT } from '../middleware/JWTActions.js';

const router = express.Router();

// Public routes (không cần auth)
router.get('/published', controller.getPublishedBlogs);
router.get('/featured', controller.getFeaturedBlogs);
router.get('/:id/public', controller.getBlogById); // Public view for specific blog

// Admin routes (cần auth)
router.get('/trash', checkUserJWT, controller.getTrashedBlogs);
router.get('/', checkUserJWT, controller.getAllBlogs); // Admin only
router.post('/', checkUserJWT, controller.createBlog); // Admin only - tác giả sẽ là user hiện tại
router.get('/:id', checkUserJWT, controller.getBlogById); // Admin view
router.patch('/:id', checkUserJWT, controller.updateBlog); // Admin only
router.delete('/:id', checkUserJWT, controller.deleteBlog); // Admin only
router.post('/:id/restore', checkUserJWT, controller.restoreBlog);
router.delete('/:id/force', checkUserJWT, controller.forceDeleteBlog);

export const blogRoute = router;
