import { Router } from 'express';
import { updateProfile, uploadAvatar, listUsers, deleteUser, changeRole, getMyProfile, createCollection, addToCollection, trackDownload, getMyExpeditions, toggleExpeditionReminder, getWishlist, toggleWishlist, changePassword } from '../controllers/userController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';

const router = Router();

// User profile
router.put('/profile', authenticate, updateProfile);
router.put('/avatar', authenticate, upload.single('avatar'), verifyFileSignature, uploadAvatar);
router.put('/password', authenticate, changePassword);
router.get('/me', authenticate, getMyProfile);

// Collections & Downloads
router.post('/collections', authenticate, createCollection);
router.post('/collections/:collectionId/items', authenticate, addToCollection);
router.post('/downloads', authenticate, trackDownload);

// Expeditions
router.get('/me/expeditions', authenticate, getMyExpeditions);
router.patch('/me/expeditions/:eventId/reminder', authenticate, toggleExpeditionReminder);

// Wishlist
router.get('/me/wishlist', authenticate, getWishlist);
router.patch('/me/wishlist/:itemId', authenticate, toggleWishlist);

// Admin - user management
router.get('/', authenticate, requirePermission('manageUsers'), listUsers);
router.delete('/:id', authenticate, requirePermission('manageUsers'), deleteUser);
router.put('/:id/role', authenticate, authorize('superadmin'), changeRole);

export default router;
