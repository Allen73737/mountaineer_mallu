import { Router } from 'express';
import { listStories, getStory, createStory, updateStory, deleteStory, getMyStories, updateStoryStatus } from '../controllers/storyController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Public routes (should ideally only list approved ones, but let's handle that in controller)
router.get('/', cacheMiddleware(300), listStories);
router.get('/:id', cacheMiddleware(300), getStory);

// User routes
router.get('/user/me', authenticate, getMyStories);
router.post('/submit', authenticate, upload.single('image'), verifyFileSignature, createStory); // sets to pending by default

// Admin routes
router.post('/', authenticate, requirePermission('manageStories'), upload.single('image'), verifyFileSignature, createStory);
router.put('/:id', authenticate, requirePermission('manageStories'), upload.single('image'), verifyFileSignature, updateStory);
router.patch('/:id/status', authenticate, requirePermission('manageStories'), updateStoryStatus);
router.delete('/:id', authenticate, requirePermission('manageStories'), deleteStory);

export default router;
