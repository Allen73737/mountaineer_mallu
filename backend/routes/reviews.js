import { Router } from 'express';
import { 
    getApprovedReviews, 
    submitReview, 
    getAllReviewsAdmin, 
    updateReviewStatus, 
    updateReview,
    deleteReview 
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public route
router.get('/', getApprovedReviews);

// Protected routes for users
router.post('/', authenticate, submitReview);

// Protected routes for admin
router.get('/admin', authenticate, authorize('admin', 'superadmin'), getAllReviewsAdmin);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), updateReview);
router.patch('/:id/status', authenticate, authorize('admin', 'superadmin'), updateReviewStatus);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteReview);

export default router;
