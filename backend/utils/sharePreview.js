// Link previews for single events and stories. Chat apps and social sites (WhatsApp, Instagram,
// Facebook, X) read the page's meta tags without running JavaScript, so the SPA's index.html would
// always show the generic site card. When the server hands out index.html for /events/:id or
// /stories/:id, it swaps in that item's title, summary and photo first.
import fs from 'fs/promises';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Story from '../models/Story.js';

const DETAIL = /^\/(events|stories)\/([a-f0-9]{24})\/?$/;
let template = null;

const esc = (s = '') => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (s = '', n = 200) => {
    const t = String(s).replace(/\s+/g, ' ').trim();
    return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

const setMeta = (html, attr, key, value) => {
    const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[:.]/g, '\\$&')}"\\s+content=")[^"]*(")`);
    return re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html;
};

const lookup = async (kind, id) => {
    if (mongoose.connection.readyState !== 1) return null;
    if (kind === 'events') {
        const e = await Event.findById(id).select('title date time location description image').lean();
        if (!e) return null;
        const when = [e.date, e.time].filter(Boolean).join(' · ');
        return {
            title: `${e.title} — Mountaineer Mallu`,
            description: clip([when, e.location].filter(Boolean).join(' · ') + (e.description ? ` — ${e.description}` : '')),
            image: e.image, type: 'event',
        };
    }
    const s = await Story.findOne({ _id: id, status: 'approved' }).select('title excerpt image author').lean();
    if (!s) return null;
    return { title: `${s.title} — Mountaineer Mallu`, description: clip(s.excerpt || `A story by ${s.author}`), image: s.image, type: 'article' };
};

/** Returns index.html with item-specific share tags, or null to fall back to the plain file. */
export const renderSharePage = async (indexPath, reqPath, siteUrl) => {
    const m = DETAIL.exec(reqPath);
    if (!m) return null;
    try {
        const item = await lookup(m[1], m[2]);
        if (!item) return null;
        if (!template || process.env.NODE_ENV !== 'production') template = await fs.readFile(indexPath, 'utf8');
        const url = `${siteUrl.replace(/\/$/, '')}${reqPath}`;
        // Cloudinary photos are resized to the 1200×630 card size the apps expect
        const image = /res\.cloudinary\.com\/.+\/upload\//.test(item.image || '')
            ? item.image.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_auto,f_jpg/')
            : item.image;

        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(item.title)}</title>`);
        html = setMeta(html, 'name', 'description', item.description);
        for (const [k, v] of [['og:title', item.title], ['og:description', item.description], ['og:url', url], ['og:type', item.type]]) {
            html = setMeta(html, 'property', k, v);
        }
        html = setMeta(html, 'name', 'twitter:title', item.title);
        html = setMeta(html, 'name', 'twitter:description', item.description);
        if (image) {
            html = setMeta(html, 'property', 'og:image', image);
            html = setMeta(html, 'name', 'twitter:image', image);
            html = setMeta(html, 'property', 'og:image:alt', item.title);
        }
        return html;
    } catch {
        return null;
    }
};
