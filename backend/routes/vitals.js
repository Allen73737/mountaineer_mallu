import express, { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import logger from '../utils/logger.js';

/**
 * Real-user performance monitoring. Browsers report Core Web Vitals (see frontend/src/lib/vitals.ts)
 * with navigator.sendBeacon; each worker keeps a rolling window per metric and admins read the p75,
 * the figure Google uses to judge a page. Poor readings are logged so regressions show up in the logs.
 */
const router = Router();

// Google's "poor" thresholds (ms, except CLS which is unitless)
const POOR = { LCP: 4000, INP: 500, CLS: 0.25, FCP: 3000, TTFB: 1800 };
const WINDOW = 500;
const samples = Object.fromEntries(Object.keys(POOR).map(k => [k, []]));

// sendBeacon posts text/plain (a JSON content type would need a CORS preflight a beacon can't do)
router.post('/', express.text({ type: '*/*', limit: '4kb' }), (req, res) => {
    let body;
    try { body = JSON.parse(req.body || '{}'); } catch { return res.status(400).end(); }
    const list = Array.isArray(body) ? body.slice(0, 10) : [body];
    for (const m of list) {
        const name = String(m?.name || '');
        const value = Number(m?.value);
        if (!(name in POOR) || !Number.isFinite(value) || value < 0 || value > 120000) continue;
        const page = String(m.page || '').slice(0, 120);
        const bucket = samples[name];
        bucket.push({ value, page, conn: String(m.conn || '').slice(0, 10), at: Date.now() });
        if (bucket.length > WINDOW) bucket.shift();
        if (value > POOR[name]) logger.warn(`[RUM] Poor ${name}=${name === 'CLS' ? value.toFixed(3) : Math.round(value)} on ${page} (${m.conn || 'unknown'} connection)`);
    }
    res.status(204).end();
});

const percentile = (values, p) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
};

// GET /api/vitals — admin: p75 per metric over this worker's recent window
router.get('/', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    const summary = Object.fromEntries(Object.entries(samples).map(([name, list]) => {
        const values = list.map(s => s.value);
        return [name, { p75: percentile(values, 0.75), samples: values.length, poor: values.filter(v => v > POOR[name]).length }];
    }));
    res.json({ summary, window: WINDOW });
});

export default router;
