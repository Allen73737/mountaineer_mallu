import { Router } from 'express';
import { getOverview, listAdmins, createAdmin, updatePermissions, revokeAdmin } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticate, authorize('admin', 'superadmin'), getOverview);
router.get('/admins', authenticate, authorize('superadmin'), listAdmins);
router.post('/admins', authenticate, authorize('superadmin'), createAdmin);
router.put('/admins/:id/permissions', authenticate, authorize('superadmin'), updatePermissions);
router.delete('/admins/:id', authenticate, authorize('superadmin'), revokeAdmin);

export default router;
