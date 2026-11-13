export const verifyCsrf = (req, res, next) => {
    // Only check for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = process.env.CLIENT_URL 
        ? process.env.CLIENT_URL.split(',') 
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

    if (!origin) {
        return res.status(403).json({ error: 'CSRF Protection: Missing Origin header.' });
    }

    // Compare exact origins (scheme + host + port). A prefix test let look-alike hosts such as
    // http://localhost:5174.evil.com through, and the Referer fallback carries a full URL.
    let requestOrigin;
    try { requestOrigin = new URL(origin).origin; } catch { requestOrigin = null; }
    const originMatches = !!requestOrigin && allowedOrigins.some(allowed => {
        try { return new URL(allowed.trim()).origin === requestOrigin; } catch { return false; }
    });

    if (!originMatches) {
        return res.status(403).json({ error: 'CSRF Protection: Origin mismatch.' });
    }

    next();
};
