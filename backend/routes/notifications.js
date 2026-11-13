import { Router } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications — latest 30 + unread count
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [items, unread] = await Promise.all([
            Notification.find({ recipient: req.user._id })
                .sort({ createdAt: -1 })
                .limit(30)
                .populate('actor', 'name avatar')
                .lean(),
            Notification.countDocuments({ recipient: req.user._id, read: false })
        ]);
        res.json({ notifications: items, unread });
    } catch (error) {
        next(error);
    }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticate, async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id.' });
        await Notification.updateOne({ _id: req.params.id, recipient: req.user._id }, { read: true });
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/notifications — clear all of mine
router.delete('/', authenticate, async (req, res, next) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
});

export default router;
