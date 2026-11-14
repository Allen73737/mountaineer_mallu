import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env first, then root fallback
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import fs from 'fs';
import express from 'express';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { randomUUID } from 'crypto';
import morgan from 'morgan';
import { createClient } from 'redis';
import RedisStore from 'rate-limit-redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { drainJobs, jobStats } from './services/jobQueue.js';
import vitalsRoutes from './routes/vitals.js';
import logger from './utils/logger.js';
import { verifyCsrf } from './middleware/csrf.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { validateEnv } from './config/envValidator.js';

// Validate critical production configurations
validateEnv();

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import eventRoutes from './routes/events.js';
import galleryRoutes from './routes/gallery.js';
import communityRoutes from './routes/community.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import pillarRoutes from './routes/pillars.js';
import reviewRoutes from './routes/reviews.js';
import merchandiseRoutes from './routes/merchandiseRoutes.js';
import aiRoutes from './routes/ai.js';
import socialRoutes from './routes/social.js';
import { errorHandler } from './middleware/errorHandler.js';
import { renderSharePage } from './utils/sharePreview.js';
import { startCronJobs } from './services/cron.js';
import { attachRealtime } from './services/notify.js';
import notificationRoutes from './routes/notifications.js';
import searchRoutes from './routes/search.js';
import seoRoutes from './routes/seo.js';
import { auditAdminActions } from './middleware/audit.js';

const app = express();

// Enable reverse proxy trust for Kubernetes, NGINX, Cloudflare, AWS ALB, Render, Railway
app.set('trust proxy', 1);

const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',') 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

// ─── Socket.io ─────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Per-user notification rooms + live community groups
attachRealtime(io);

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// ─── Security Middleware ───────────────────────────────────────────────

// Request ID for traceability
app.use((req, res, next) => {
    req.id = randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// Request timing: a Server-Timing header (visible in the browser's network panel) and a warning for
// slow requests, so a sluggish endpoint is noticed even without OpenTelemetry (see tracing.js)
const SLOW_REQUEST_MS = parseInt(process.env.SLOW_REQUEST_MS || '1000', 10);
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    const elapsed = () => Number(process.hrtime.bigint() - start) / 1e6;
    const writeHead = res.writeHead;
    res.writeHead = function (...args) {
        if (!res.headersSent) res.setHeader('Server-Timing', `app;dur=${elapsed().toFixed(1)}`);
        return writeHead.apply(this, args);
    };
    res.on('finish', () => {
        const ms = elapsed();
        if (ms > SLOW_REQUEST_MS && !req.headers.accept?.includes('text/event-stream')) {
            logger.warn(`[Slow] ${req.method} ${req.originalUrl} ${res.statusCode} took ${ms.toFixed(0)}ms (request ${req.id})`);
        }
    });
    next();
});

// Setup Morgan to use Winston logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Set up Redis Client for Rate Limiting (Graceful Fallback if Redis is offline)
let isRedisConnected = false;
let redisClient = null;

if (process.env.REDIS_URL) {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => (retries > 3 ? false : Math.min(retries * 200, 2000))
            }
        });
        redisClient.on('ready', () => { 
            isRedisConnected = true; 
            logger.info('✅ Redis connected successfully'); 
        });
        redisClient.on('error', (err) => {
            if (isRedisConnected) {
                logger.warn(`Redis Client Error: ${err.message}`);
            }
            isRedisConnected = false;
        });
        redisClient.connect().catch(() => {
            isRedisConnected = false;
        });

        // Share Socket.IO rooms across every app instance / cluster worker behind the load balancer:
        // without it, a notification emitted on one instance never reaches a user connected to another
        const pubClient = redisClient.duplicate();
        const subClient = redisClient.duplicate();
        pubClient.on('error', () => {});
        subClient.on('error', () => {});
        Promise.all([pubClient.connect(), subClient.connect()])
            .then(() => {
                io.adapter(createAdapter(pubClient, subClient));
                logger.info('✅ Socket.IO Redis adapter attached (multi-instance realtime)');
            })
            .catch(err => logger.warn(`Socket.IO Redis adapter unavailable, realtime stays per-instance: ${err.message}`));
    } catch {
        isRedisConnected = false;
    }
}

const createRateLimiter = (options) => {
    const store = (isRedisConnected && redisClient?.isReady) 
        ? new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) 
        : undefined;
    return rateLimit({ ...options, store });
};

// Build assets may come from a CDN (frontend VITE_CDN_URL); set CDN_URL to the same origin here
const CDN_ORIGIN = (() => { try { return process.env.CDN_URL ? [new URL(process.env.CDN_URL).origin] : []; } catch { return []; } })();

// Helmet with strict CSP (permitting trusted CDNs, Unsplash imagery, and Open-Meteo)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // plausible.io: optional cookie-free analytics (only loaded when VITE_ANALYTICS_DOMAIN is set)
            scriptSrc: ["'self'", ...CDN_ORIGIN, "https://accounts.google.com", "https://apis.google.com", "https://plausible.io"],
            styleSrc: ["'self'", ...CDN_ORIGIN, "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com"],
            imgSrc: [
                "'self'", 
                ...CDN_ORIGIN,
                "data:", 
                "blob:", 
                "https://res.cloudinary.com", 
                "https://images.unsplash.com", 
                "https://*.unsplash.com", 
                "https://*.googleusercontent.com"
            ],
            fontSrc: ["'self'", ...CDN_ORIGIN, "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'", 
                ...CLIENT_URL, 
                "https://accounts.google.com", 
                "https://api.open-meteo.com",
                // Optional error tracking and analytics (see frontend/src/lib/monitoring.ts)
                "https://*.ingest.sentry.io",
                "https://*.ingest.de.sentry.io",
                "https://*.ingest.us.sentry.io",
                "https://plausible.io",
                "ws:",
                "wss:"
            ],
            frameSrc: ["https://accounts.google.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

// Rate limiting — sized for real browsing. A dashboard view fires a dozen GETs, and every page load
// calls /api/auth/me, so session checks and health probes must never count against brute-force budgets.
const isDev = process.env.NODE_ENV !== 'production';
const scale = (n) => (isDev ? n * 10 : n);

const limiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: scale(1000),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' || (req.method === 'GET' && req.path === '/auth/me'),
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Brute-force guard for credential endpoints only; successful sign-ins don't use up the budget
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: scale(10),
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
});
app.use(['/api/auth/login', '/api/auth/signup', '/api/auth/google', '/api/auth/demo-login'], authLimiter);

// Extra strict rate limit for OTP/password reset (5 per 15 min)
const otpLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: scale(5),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many reset attempts. Please wait and try again.' },
});
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/reset-password', otpLimiter);

// AI usage limit (60 per 15 min)
const aiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: scale(60),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI usage limit reached. Please wait a moment.' },
});
app.use('/api/ai/', aiLimiter);

// ─── Body Parsing & CORS ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Custom Input sanitization — Deep XSS, prototype pollution
app.use(sanitizeInputs);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// CSRF Protection (Origin Header Verification)
app.use(verifyCsrf);

// Brotli (preferred, quality 4) or Gzip, negotiated from Accept-Encoding. Server-sent events are
// excluded: the compressor buffers output, which would hold back AI chat tokens until the reply ends.
app.use(compression({
    filter: (req, res) => {
        if (req.headers.accept?.includes('text/event-stream')) return false;
        if (String(res.getHeader('Content-Type') || '').includes('text/event-stream')) return false;
        return compression.filter(req, res);
    },
}));

// Cache Control for public GET endpoints (Instant response optimization)
app.use((req, res, next) => {
    if (req.method === 'GET') {
        const path = req.path;
        if (
            path.startsWith('/api/stories') ||
            path.startsWith('/api/events') ||
            path.startsWith('/api/gallery') ||
            path.startsWith('/api/settings') ||
            path.startsWith('/api/pillars') ||
            path.startsWith('/api/reviews') ||
            path.startsWith('/api/merchandise')
        ) {
            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        }
    }
    next();
});

app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID']
}));

// ─── Health Checks (Kubernetes, AWS ALB, Docker, Cloud Run Probes) ─────
// Lightweight Liveness Probe
app.get('/livez', (req, res) => {
    res.status(200).send('OK');
});

// Comprehensive Readiness & Diagnostic Health Probe
const handleHealthCheck = (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    const mem = process.memoryUsage();
    
    const healthStatus = {
        status: isDbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        environment: process.env.NODE_ENV || 'development',
        database: {
            connected: isDbConnected,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
        },
        redis: {
            connected: isRedisConnected && redisClient?.isOpen
        },
        system: {
            memoryRssMB: (mem.rss / 1024 / 1024).toFixed(1),
            heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1)
        },
        sockets: io ? io.engine.clientsCount : 0,
        jobs: jobStats()
    };

    const httpCode = isDbConnected ? 200 : 503;
    res.status(httpCode).json(healthStatus);
};

app.get('/healthz', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// ─── API Routes ────────────────────────────────────────────────────────
// Record every successful admin write for the audit log
app.use('/api', auditAdminActions);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pillars', pillarRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/vitals', vitalsRoutes);
// Crawler-facing: sitemap, robots-friendly share pages with Open Graph tags
app.use('/', seoRoutes);

// ─── Production Static Serving (Single-Container & Monolith Deployments) ─
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath, {
        maxAge: '1h',
        // /stories → stories.html: section pages pre-rendered at build time with their own title and share tags
        extensions: ['html'],
        setHeaders: (res, filePath) => {
            if (filePath.includes(`${path.sep}assets${path.sep}`)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else if (filePath.endsWith('sw.js') || filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));

    // Client-side SPA routing fallback for all non-API GET requests
    app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/healthz') || req.path.startsWith('/livez')) {
            return next();
        }
        // Single event / story links get their own share card (title, summary, photo)
        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
        const html = await renderSharePage(path.join(frontendDistPath, 'index.html'), req.path, siteUrl);
        if (html) {
            res.setHeader('Cache-Control', 'no-cache');
            return res.type('html').send(html);
        }
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// ─── Error Handling ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ────────────────────────────────
export const startServer = async () => {
    // `node --watch` restarts faster than Windows releases the port, and an unhandled 'error' event here
    // left the process alive but not listening (the API "turned off"). Retry the bind instead.
    let bindAttempts = 0;
    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && bindAttempts < 20) {
            bindAttempts++;
            console.warn(`⚠️ Port ${PORT} is still in use — retrying (${bindAttempts}/20)...`);
            setTimeout(() => httpServer.listen(PORT), 1000);
            return;
        }
        console.error(`❌ HTTP server error: ${err.message}`);
        if (err.code === 'EADDRINUSE') process.exit(1);
    });
    httpServer.listen(PORT, () => {
        console.log(`🏔️  Worker ${process.pid} running API on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        startCronJobs();
    });

    const connectMongo = async () => {
        try {
            const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10);
            const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE || '5', 10);

            if (!process.env.MONGODB_URI) {
                console.error('[MongoDB] MONGODB_URI is not set in environment variables.');
                return;
            }

            await mongoose.connect(process.env.MONGODB_URI, {
                dbName: 'mountaineer-mallu',
                serverSelectionTimeoutMS: 8000,
                // Sockets that died while the machine slept fail fast and the read is retried on a fresh one,
                // instead of a request hanging for most of a minute
                socketTimeoutMS: 20000,
                connectTimeoutMS: 10000,
                maxPoolSize,
                minPoolSize,
                w: 'majority',
                retryWrites: true
            });
            console.log(`✅ MongoDB connected successfully [Pool: ${minPoolSize}-${maxPoolSize}] in Worker ${process.pid}`);
        } catch (error) {
            console.error(`❌ Worker ${process.pid} MongoDB connection failed:`, error.message);
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            } else {
                console.warn(`⚠️ [Worker ${process.pid}] Database degraded. Re-attempting MongoDB connection in 10s...`);
                setTimeout(connectMongo, 10000);
            }
        }
    };

    mongoose.connection.on('error', (err) => logger.error(`[MongoDB] Connection error: ${err.message}`));
    mongoose.connection.on('disconnected', () => logger.warn('[MongoDB] Disconnected from server.'));
    mongoose.connection.on('reconnected', () => logger.info('[MongoDB] Reconnected successfully.'));

    await connectMongo();

    // Keep the pool warm: a tiny ping every 30 s stops idle connections going stale (Atlas, laptop sleep),
    // which is what made the first admin / settings request after a pause take 3-8 s
    setInterval(() => {
        if (mongoose.connection.readyState !== 1) return;
        mongoose.connection.db.admin().command({ ping: 1 }).catch(() => {});
    }, 30000).unref();
};

// ─── Graceful Shutdown Handler (Docker, K8s, Render, Railway, AWS) ────
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 [Worker ${process.pid}] Received ${signal}. Initiating graceful shutdown...`);
    
    httpServer.close(async () => {
        console.log(`  ✓ HTTP server stopped accepting connections.`);
        try {
            // Let queued emails finish before the process goes away (bounded so shutdown stays under the hard kill)
            await drainJobs(6000);
            console.log(`  ✓ Background jobs drained.`);
            if (io) {
                io.close();
                console.log(`  ✓ Socket.io connections terminated.`);
            }
            if (isRedisConnected && redisClient?.isOpen) {
                await redisClient.quit();
                console.log(`  ✓ Redis connection closed.`);
            }
            await mongoose.connection.close(false);
            console.log(`  ✓ MongoDB connection closed.`);
            console.log(`✨ Graceful shutdown finished cleanly.`);
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // Enforce maximum 10s grace timeout before hard kill
    setTimeout(() => {
        console.error('⚠️ Forcefully terminating after 10s grace period timeout.');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// If this file is run directly (not via server.js), start it directly.
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
    startServer();
}

export default app;
