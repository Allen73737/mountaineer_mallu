import express from 'express';
import {
    getMerchandises,
    createMerchandise,
    updateMerchandise,
    deleteMerchandise
} from '../controllers/merchandiseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, verifyFileSignature } from '../middleware/upload.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.route('/')
    .get(cacheMiddleware(300), getMerchandises)
    .post(authenticate, authorize('admin', 'superadmin'), upload.single('image'), verifyFileSignature, createMerchandise);

router.route('/:id')
    .put(authenticate, authorize('admin', 'superadmin'), upload.single('image'), verifyFileSignature, updateMerchandise)
    .delete(authenticate, authorize('admin', 'superadmin'), deleteMerchandise);

export default router;
