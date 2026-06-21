import dotenv from 'dotenv';
dotenv.config();
import NodeCache from 'node-cache';
import { createClient } from 'redis';

// --- L1 Cache (Memory) ---
// Standard local memory cache: 5 minutes TTL
const l1Cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// --- L2 Cache (Redis) ---
let redisClient = null;
let isRedisConnected = false;

const initRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn('[Cache] REDIS_URL not provided. Running with L1 cache only.');
        return;
    }

    try {
        redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on('error', (err) => {
            console.error('[Redis Error]', err);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('[Redis] Connected to L2 Cache');
            isRedisConnected = true;
        });

        redisClient.on('ready', () => {
            isRedisConnected = true;
        });

        await redisClient.connect();
    } catch (err) {
        console.error('[Redis Init Error]', err);
        isRedisConnected = false;
    }
};

// Initialize immediately
initRedis();

/**
 * Tiered Cache Middleware (L1 Memory -> L2 Redis)
 * High-performance resilient caching.
 */
export const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;

        // 1. Try L1 Cache (Ultra-low latency memory)
        const l1Data = l1Cache.get(key);
        if (l1Data) {
            res.setHeader('X-Cache-Tier', 'L1-HIT');
            return res.status(200).json(JSON.parse(l1Data));
        }

        // 2. Try L2 Cache (Redis)
        if (isRedisConnected && redisClient) {
            try {
                const l2Data = await redisClient.get(key);
                if (l2Data) {
                    // Backfill L1 Cache so the next request is faster
                    l1Cache.set(key, l2Data, duration);
                    res.setHeader('X-Cache-Tier', 'L2-HIT');
                    return res.status(200).json(JSON.parse(l2Data));
                }
            } catch (err) {
                console.error('[Redis GET Error]', err);
                // Fallthrough to DB on Redis error
            }
        }

        // 3. Cache Miss (Database fallback)
        res.setHeader('X-Cache-Tier', 'MISS');
        
        // Intercept response to save to cache
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const stringBody = JSON.stringify(body);
                
                // Write to L1 Cache
                l1Cache.set(key, stringBody, duration);
                
                // Write to L2 Cache asynchronously
                if (isRedisConnected && redisClient) {
                    redisClient.setEx(key, duration, stringBody).catch(err => {
                        console.error('[Redis SET Error]', err);
                    });
                }
            }
            return originalJson(body);
        };
        next();
    };
};

/**
 * Clears cache for both L1 and L2 across routes matching the prefix.
 */
export const clearCachePrefix = async (prefix) => {
    // 1. Clear L1
    const l1Keys = l1Cache.keys();
    const l1KeysToDelete = l1Keys.filter(key => key.includes(prefix));
    if (l1KeysToDelete.length > 0) {
        l1Cache.del(l1KeysToDelete);
    }

    // 2. Clear L2
    if (isRedisConnected && redisClient) {
        try {
            // Find keys matching the prefix pattern in Redis
            const keys = await redisClient.keys(`*${prefix}*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (err) {
            console.error('[Redis DEL Error]', err);
        }
    }
};

export default cacheMiddleware;
