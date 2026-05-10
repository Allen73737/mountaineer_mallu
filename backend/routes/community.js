import { Router } from 'express';
import {
    listGroups, getGroup, createGroup,
    requestJoin, approveJoin, removeMember,
    createPost, addComment, pinMessage,
    assignModerator, deleteGroup, getMyGroups
} from '../controllers/communityController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/groups', listGroups);
router.get('/groups/me', authenticate, getMyGroups);
router.get('/groups/:id', authenticate, getGroup);
router.post('/groups', authenticate, requirePermission('manageCommunity'), createGroup);
router.delete('/groups/:id', authenticate, requirePermission('manageCommunity'), deleteGroup);
router.post('/groups/:id/join', authenticate, requestJoin);
router.put('/groups/:id/approve/:userId', authenticate, approveJoin);
router.delete('/groups/:id/members/:userId', authenticate, removeMember);
router.post('/groups/:id/posts', authenticate, upload.single('image'), createPost);
router.post('/groups/:id/posts/:postId/comments', authenticate, addComment);
router.put('/groups/:id/pin', authenticate, pinMessage);
router.put('/groups/:id/moderators/:userId', authenticate, requirePermission('manageCommunity'), assignModerator);

export default router;
