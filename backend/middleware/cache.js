import NodeCache from 'node-cache';
import { createClient } from 'redis';

// ─── L1 In-Memory Cache (Ultra-fast, ~0.1ms access) ───────────────────────────
const l1Cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// ─── L2 Distributed Redis Cache (Cluster-shared across all workers) ───────────
let redisClient = null;
let isRedisReady = false;

if (process.env.REDIS_URL) {
    try {
        redisClient = createClient({ url: process.env.REDIS_URL });
        redisClient.on('ready', () => {
            isRedisReady = true;
        });
        redisClient.on('error', () => {
            isRedisReady = false;
        });
        redisClient.connect().catch(() => {
            isRedisReady = false;
        });
    } catch {
        isRedisReady = false;
    }
}

/**
 * Enterprise Dual-Tier Cache Middleware (L1 Memory + L2 Redis)
 * @param {number} ttlSeconds Time-to-live in seconds (default: 300)
 */
export const cacheMiddleware = (ttlSeconds = 300) => {
    return async (req, res, next) => {
        // Only cache idempotent GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Do not cache authenticated user-specific requests
        if (req.headers.authorization || req.originalUrl.includes('/me') || req.originalUrl.includes('/admin')) {
            return next();
        }

        const cacheKey = `cache:${req.originalUrl || req.url}`;

        // 1. Check L1 In-Memory Cache
        const l1Data = l1Cache.get(cacheKey);
        if (l1Data) {
            res.setHeader('X-Cache', 'HIT-L1');
            return res.json(l1Data);
        }

        // 2. Check L2 Redis Cache (if online)
        if (isRedisReady && redisClient?.isOpen) {
            try {
                const redisData = await redisClient.get(cacheKey);
                if (redisData) {
                    const parsed = JSON.parse(redisData);
                    // Populate L1 for subsequent instant hits
                    l1Cache.set(cacheKey, parsed, Math.min(ttlSeconds, 60));
                    res.setHeader('X-Cache', 'HIT-L2');
                    return res.json(parsed);
                }
            } catch {
                // Non-blocking fallback to origin
            }
        }

        // 3. Cache Miss: Intercept response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Populate L1
                l1Cache.set(cacheKey, body, ttlSeconds);

                // Populate L2 Redis asynchronously
                if (isRedisReady && redisClient?.isOpen) {
                    redisClient.set(cacheKey, JSON.stringify(body), { EX: ttlSeconds }).catch(() => {});
                }
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
};

/**
 * Clear cached keys matching an optional pattern
 * @param {string} [keyPattern] Substring or pattern to match (e.g., 'stories', 'events')
 */
export const clearCache = async (keyPattern) => {
    // Purge from L1
    if (keyPattern) {
        const keys = l1Cache.keys();
        keys.forEach((k) => {
            if (k.includes(keyPattern)) {
                l1Cache.del(k);
            }
        });
    } else {
        l1Cache.flushAll();
    }

    // Purge from L2 Redis
    if (isRedisReady && redisClient?.isOpen) {
        try {
            const pattern = keyPattern ? `cache:*${keyPattern}*` : 'cache:*';
            const keys = await redisClient.keys(pattern);
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch {
            // Non-fatal
        }
    }
};
