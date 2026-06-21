import express from 'express';
import {
    getMerchandises,
    createMerchandise,
    updateMerchandise,
    deleteMerchandise
} from '../controllers/merchandiseController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.route('/')
    .get(cacheMiddleware(300), getMerchandises)
    .post(authenticate, requirePermission('manageContent'), upload.single('image'), verifyFileSignature, createMerchandise);

router.route('/:id')

    .put(authenticate, requirePermission('manageContent'), upload.single('image'), verifyFileSignature, updateMerchandise)
    .delete(authenticate, requirePermission('manageContent'), deleteMerchandise);

export default router;
