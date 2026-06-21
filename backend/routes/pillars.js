import { Router } from 'express';
import { getPillars, createPillar, updatePillar, deletePillar } from '../controllers/pillarController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';

const router = Router();

router.get('/', getPillars);
router.post('/', authenticate, authorize('admin', 'superadmin'), upload.single('image'), verifyFileSignature, createPillar);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), upload.single('image'), verifyFileSignature, updatePillar);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deletePillar);

export default router;
