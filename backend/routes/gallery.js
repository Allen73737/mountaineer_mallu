import { Router } from 'express';
import { listApproved, listPending, listAll, uploadMedia, approveMedia, rejectMedia, deleteMedia, getMyMedia, toggleLike, updateMedia } from '../controllers/galleryController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', listApproved);

// User routes
router.get('/user/me', authenticate, getMyMedia);
router.post('/', authenticate, upload.single('media'), uploadMedia);
router.post('/:id/like', authenticate, toggleLike);

// Admin routes
router.get('/pending', authenticate, requirePermission('manageGallery'), listPending);
router.get('/all', authenticate, requirePermission('manageGallery'), listAll);
router.put('/:id', authenticate, requirePermission('manageGallery'), updateMedia);
router.put('/:id/approve', authenticate, requirePermission('manageGallery'), approveMedia);
router.put('/:id/reject', authenticate, requirePermission('manageGallery'), rejectMedia);
router.delete('/:id', authenticate, requirePermission('manageGallery'), deleteMedia);

export default router;
