import { Router } from 'express';
import { getOverview, listAdmins, createAdmin, updatePermissions, revokeAdmin, getSecurityDigest } from '../controllers/adminController.js';
import { generateCampaign, listCampaigns, approveCampaign, deleteCampaign } from '../controllers/campaignController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticate, authorize('admin', 'superadmin'), getOverview);
router.get('/admins', authenticate, authorize('superadmin'), listAdmins);
router.post('/admins', authenticate, authorize('superadmin'), createAdmin);
router.put('/admins/:id/permissions', authenticate, authorize('superadmin'), updatePermissions);
router.delete('/admins/:id', authenticate, authorize('superadmin'), revokeAdmin);

// Security Digest
router.get('/security-digest', authenticate, authorize('admin', 'superadmin'), getSecurityDigest);

// Campaign Autopilot
router.post('/campaigns/generate', authenticate, authorize('superadmin'), generateCampaign);
router.get('/campaigns', authenticate, authorize('admin', 'superadmin'), listCampaigns);
router.post('/campaigns/:id/approve', authenticate, authorize('superadmin'), approveCampaign);
router.delete('/campaigns/:id', authenticate, authorize('superadmin'), deleteCampaign);

export default router;
