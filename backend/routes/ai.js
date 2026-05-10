import express from 'express';
import { chatStream, getPeakInfo } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/chat — SSE streaming chat
router.post('/chat', chatStream);

// POST /api/ai/peak-info — Quick peak information
router.post('/peak-info', getPeakInfo);

export default router;
