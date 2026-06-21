import express from 'express';
import { chatStream, getPeakInfo, getThemeSuggestion, getRouteBriefing, getStoryDraft, tagGalleryItem, bulkTagGallery, getReviewSummary } from '../controllers/aiController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/chat — SSE streaming chat
router.post('/chat', chatStream);

// POST /api/ai/peak-info — Quick peak information
router.post('/peak-info', getPeakInfo);

// POST /api/ai/theme-suggestion — Adaptive theme for user portal (requires auth)
router.post('/theme-suggestion', authenticate, getThemeSuggestion);

// POST /api/ai/route-briefing — AI route briefing for an expedition (requires auth)
router.post('/route-briefing', authenticate, getRouteBriefing);

// POST /api/ai/story-draft — AI story writer assistant (requires auth)
router.post('/story-draft', authenticate, getStoryDraft);

// POST /api/ai/gallery-tag — Smart gallery auto-tagger (admin only)
router.post('/gallery-tag', authenticate, authorize('admin', 'superadmin'), tagGalleryItem);

// POST /api/ai/gallery-tag-all — Bulk auto-tag all untagged gallery items (admin only)
router.post('/gallery-tag-all', authenticate, authorize('admin', 'superadmin'), bulkTagGallery);

// GET /api/ai/review-summary — AI review sentiment summarizer (admin only)
router.get('/review-summary', authenticate, authorize('admin', 'superadmin'), getReviewSummary);

// POST /api/ai/suggest-images — AI Unsplash Image Suggestion (requires auth)
import { suggestImages, searchUnsplash } from '../controllers/aiController.js';
router.post('/suggest-images', authenticate, suggestImages);

// POST /api/ai/unsplash-search — Manual Unsplash Image Search (requires auth)
router.post('/unsplash-search', authenticate, searchUnsplash);

export default router;
