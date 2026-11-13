import { Router } from 'express';
import Story from '../models/Story.js';
import Event from '../models/Event.js';
import Group from '../models/Group.js';
import GalleryItem from '../models/GalleryItem.js';
import Pillar from '../models/Pillar.js';
import Merchandise from '../models/Merchandise.js';
import { parseEventStart } from '../utils/eventDate.js';

const router = Router();

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/search?q=zugspitze — public content only, max 6 hits per kind
router.get('/', async (req, res, next) => {
    try {
        const q = String(req.query.q || '').trim().slice(0, 80);
        if (q.length < 2) return res.json({ results: [] });
        const re = new RegExp(escape(q), 'i');
        const LIMIT = 6;

        const [stories, events, groups, media, team, merch] = await Promise.all([
            Story.find({ status: 'approved', $or: [{ title: re }, { excerpt: re }, { region: re }, { author: re }] })
                .select('title excerpt region image').limit(LIMIT).lean(),
            Event.find({ $or: [{ title: re }, { location: re }, { type: re }, { description: re }] })
                .select('title location date time image category').limit(LIMIT).lean(),
            Group.find({ $or: [{ name: re }, { description: re }] }).select('name description members').limit(LIMIT).lean(),
            GalleryItem.find({ status: 'approved', title: re }).select('title url thumbnailUrl type').limit(LIMIT).lean(),
            Pillar.find({ $or: [{ name: re }, { role: re }] }).select('name role image').limit(LIMIT).lean(),
            Merchandise.find({ name: re }).select('name price image').limit(LIMIT).lean(),
        ]);

        const results = [
            ...stories.map(s => ({ kind: 'story', id: s._id, title: s.title, subtitle: s.region, image: s.image, href: `/stories/${s._id}` })),
            ...events.map(e => ({ kind: 'event', id: e._id, title: e.title, subtitle: [e.location, e.date].filter(Boolean).join(' · '), image: e.image, href: `/events/${e._id}`, start: parseEventStart(e.date, e.time) })),
            ...groups.map(g => ({ kind: 'group', id: g._id, title: g.name, subtitle: `${g.members?.length || 0} members`, href: '/community' })),
            ...media.map(m => ({ kind: 'media', id: m._id, title: m.title, subtitle: m.type === 'video' ? 'Video' : 'Photo', image: m.thumbnailUrl || m.url, href: '/gallery' })),
            ...team.map(p => ({ kind: 'team', id: p._id, title: p.name, subtitle: p.role, image: p.image, href: '/team' })),
            ...merch.map(m => ({ kind: 'shop', id: m._id, title: m.name, subtitle: m.price != null ? `€${m.price}` : 'Shop', image: m.image, href: '/shop' })),
        ];

        res.set('Cache-Control', 'public, max-age=60');
        res.json({ results });
    } catch (error) {
        next(error);
    }
});

export default router;
