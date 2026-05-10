import { Router } from 'express';
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent } from '../controllers/eventController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, requirePermission('manageEvents'), upload.single('image'), createEvent);
router.put('/:id', authenticate, requirePermission('manageEvents'), upload.single('image'), updateEvent);
router.delete('/:id', authenticate, requirePermission('manageEvents'), deleteEvent);
router.post('/:id/register', authenticate, registerForEvent);
router.delete('/:id/unregister', authenticate, unregisterFromEvent);

export default router;
