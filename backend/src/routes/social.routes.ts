import express from 'express';
import { getInstagramFeed, getYouTubeFeed } from '../controllers/social.controller';

const router = express.Router();

router.get('/instagram', getInstagramFeed);
router.get('/youtube', getYouTubeFeed);

export default router;
