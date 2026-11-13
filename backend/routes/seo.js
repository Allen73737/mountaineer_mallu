import { Router } from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story.js';
import Event from '../models/Event.js';
import { parseEventStart } from '../utils/eventDate.js';

/**
 * Crawler-facing pages. Social apps (WhatsApp, Facebook, X, LinkedIn) don't run JavaScript, so a
 * single-page app shows the same generic preview for every link. Share links point here instead:
 * the page carries real Open Graph tags for that story or expedition, then forwards people to the app.
 */
const router = Router();

const SITE_URL = (process.env.SITE_URL || 'https://mountaineermallu.com').replace(/\/$/, '');
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Cloudinary images are cropped to the 1200×630 social card shape; other URLs pass through
const ogImage = (url) => {
    if (!url) return `${SITE_URL}/og-default.jpg`;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/');
    }
    return url;
};

const sharePage = ({ title, description, image, url, type = 'article', jsonLd }) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Mountaineer Mallu</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:site_name" content="Mountaineer Mallu">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
<meta http-equiv="refresh" content="0;url=${esc(url)}">
<style>body{margin:0;display:grid;place-items:center;height:100vh;background:#05080D;color:#F8FAF9;font:15px system-ui}a{color:#A3C9E2}</style>
</head><body><p>Opening <a href="${esc(url)}">${esc(title)}</a>…</p>
<script>location.replace(${JSON.stringify(url)})</script>
</body></html>`;

const validId = (id) => mongoose.isValidObjectId(id);

router.get('/share/stories/:id', async (req, res, next) => {
    try {
        const story = validId(req.params.id) ? await Story.findOne({ _id: req.params.id, status: 'approved' }).lean() : null;
        if (!story) return res.redirect(302, `${SITE_URL}/stories`);
        res.set('Cache-Control', 'public, max-age=600');
        res.type('html').send(sharePage({
            title: story.title,
            description: story.excerpt || `An expedition story from ${story.region}.`,
            image: ogImage(story.image),
            url: `${SITE_URL}/stories/${story._id}`,
            jsonLd: {
                '@context': 'https://schema.org', '@type': 'Article',
                headline: story.title, description: story.excerpt, image: [story.image],
                author: { '@type': 'Person', name: story.author },
                datePublished: story.createdAt, publisher: { '@type': 'Organization', name: 'Mountaineer Mallu' },
            },
        }));
    } catch (error) {
        next(error);
    }
});

router.get('/share/events/:id', async (req, res, next) => {
    try {
        const event = validId(req.params.id) ? await Event.findById(req.params.id).lean() : null;
        if (!event) return res.redirect(302, `${SITE_URL}/events`);
        const start = parseEventStart(event.date, event.time);
        res.set('Cache-Control', 'public, max-age=600');
        res.type('html').send(sharePage({
            title: event.title,
            description: `${event.date} · ${event.location} · ${event.difficulty}. ${Math.max(0, event.totalSlots - (event.participants?.length || 0))} places left.`,
            image: ogImage(event.image),
            url: `${SITE_URL}/events/${event._id}`,
            type: 'website',
            jsonLd: start ? {
                '@context': 'https://schema.org', '@type': 'Event',
                name: event.title, description: event.description || event.title, image: [event.image],
                startDate: start.toISOString(), eventStatus: 'https://schema.org/EventScheduled',
                eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                location: { '@type': 'Place', name: event.location, address: event.location },
                organizer: { '@type': 'Organization', name: 'Mountaineer Mallu', url: SITE_URL },
                maximumAttendeeCapacity: event.totalSlots,
                remainingAttendeeCapacity: Math.max(0, event.totalSlots - (event.participants?.length || 0)),
            } : null,
        }));
    } catch (error) {
        next(error);
    }
});

// GET /sitemap.xml — static sections plus every approved story and every expedition
router.get('/sitemap.xml', async (req, res, next) => {
    try {
        const [stories, events] = await Promise.all([
            Story.find({ status: 'approved' }).select('_id updatedAt').lean(),
            Event.find().select('_id updatedAt').lean(),
        ]);
        const statics = ['', '/stories', '/events', '/gallery', '/community', '/team', '/reviews', '/shop', '/contact'];
        const url = (loc, lastmod, priority) => `<url><loc>${SITE_URL}${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}<priority>${priority}</priority></url>`;
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${statics.map(p => url(p, null, p === '' ? '1.0' : '0.8')).join('\n')}
${stories.map(s => url(`/stories/${s._id}`, s.updatedAt, '0.7')).join('\n')}
${events.map(e => url(`/events/${e._id}`, e.updatedAt, '0.7')).join('\n')}
</urlset>`;
        res.set('Cache-Control', 'public, max-age=3600');
        res.type('application/xml').send(xml);
    } catch (error) {
        next(error);
    }
});

export default router;
