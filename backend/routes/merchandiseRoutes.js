import express from 'express';
import {
    getMerchandises,
    createMerchandise,
    updateMerchandise,
    deleteMerchandise
} from '../controllers/merchandiseController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .get(getMerchandises)
    .post(authenticate, requirePermission('manageContent'), upload.single('image'), createMerchandise);

router.route('/:id')
    .put(authenticate, requirePermission('manageContent'), upload.single('image'), updateMerchandise)
    .delete(authenticate, requirePermission('manageContent'), deleteMerchandise);

export default router;
