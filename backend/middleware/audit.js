import SecurityLog from '../models/SecurityLog.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
// Readable labels for the audit trail; anything unmatched falls back to "METHOD /path"
const LABELS = [
    [/^\/api\/stories\/[^/]+\/status$/, 'Changed a story status'],
    [/^\/api\/stories\/bulk-status$/, 'Bulk-moderated stories'],
    [/^\/api\/gallery\/[^/]+\/approve$/, 'Approved media'],
    [/^\/api\/gallery\/[^/]+\/reject$/, 'Rejected media'],
    [/^\/api\/gallery\/bulk-status$/, 'Bulk-moderated media'],
    [/^\/api\/reviews\/[^/]+\/status$/, 'Changed a review status'],
    [/^\/api\/reviews\/bulk-status$/, 'Bulk-moderated reviews'],
    [/^\/api\/events\/[^/]+\/message$/, 'Messaged expedition participants'],
    [/^\/api\/admin\/admins/, 'Changed administrator access'],
    [/^\/api\/settings/, 'Updated site settings'],
];

/**
 * After a successful write by an admin, store a short line in SecurityLog (type admin_action).
 * Runs on 'finish' so it sees req.user set by the route's own authenticate middleware.
 */
export const auditAdminActions = (req, res, next) => {
    if (!MUTATING.has(req.method)) return next();
    res.on('finish', () => {
        const user = req.user;
        if (!user || !['admin', 'superadmin'].includes(user.role)) return;
        if (res.statusCode >= 400) return;
        const path = req.originalUrl.split('?')[0];
        if (path.startsWith('/api/notifications') || path.startsWith('/api/ai')) return;
        const label = LABELS.find(([re]) => re.test(path))?.[1];
        SecurityLog.create({
            type: 'admin_action',
            userId: user._id,
            email: user.email,
            ip: req.ip,
            userAgent: (req.headers['user-agent'] || '').slice(0, 300),
            details: label ? `${label} (${req.method} ${path})` : `${req.method} ${path}`,
            page: path,
        }).catch(() => { /* audit must never break a request */ });
    });
    next();
};
