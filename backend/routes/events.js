import { Router } from 'express';
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent } from '../controllers/eventController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware(300), listEvents);
router.get('/:id', cacheMiddleware(300), getEvent);
router.post('/', authenticate, requirePermission('manageEvents'), upload.single('image'), verifyFileSignature, createEvent);
router.put('/:id', authenticate, requirePermission('manageEvents'), upload.single('image'), verifyFileSignature, updateEvent);
router.delete('/:id', authenticate, requirePermission('manageEvents'), deleteEvent);
router.post('/:id/register', authenticate, registerForEvent);
router.delete('/:id/unregister', authenticate, unregisterFromEvent);

export default router;
