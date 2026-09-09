import NodeCache from 'node-cache';

// Initialize in-memory cache with 5-minute default TTL (Time To Live)
const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const cacheMiddleware = (ttlSeconds = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = req.originalUrl || req.url;
        const cachedResponse = apiCache.get(cacheKey);

        if (cachedResponse) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cachedResponse);
        }

        // Intercept res.json to store in cache
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) {
                apiCache.set(cacheKey, body, ttlSeconds);
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
};

export const clearCache = (keyPattern) => {
    if (keyPattern) {
        const keys = apiCache.keys();
        keys.forEach((key) => {
            if (key.includes(keyPattern)) {
                apiCache.del(key);
            }
        });
    } else {
        apiCache.flushAll();
    }
};
