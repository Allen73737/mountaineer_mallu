import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import logger from './utils/logger.js';
import { verifyCsrf } from './middleware/csrf.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { validateEnv } from './config/envValidator.js';

// Validate critical production configurations
validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import { startCronJobs } from './services/cron.js';

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

// Setup Morgan to use Winston logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Set up Redis Client for Rate Limiting (Graceful Fallback if Redis is offline)
let isRedisConnected = false;
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('ready', () => { isRedisConnected = true; logger.info('✅ Redis connected successfully'); });
redisClient.on('error', (err) => {
    if (isRedisConnected) {
        logger.warn(`Redis Client Error: ${err.message}`);
    }
    isRedisConnected = false;
});
redisClient.connect().catch(() => { isRedisConnected = false; });

const createRateLimiter = (options) => {
    const store = (isRedisConnected && redisClient.isReady) 
        ? new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) 
        : undefined;
    return rateLimit({ ...options, store });
};

// Helmet with strict CSP (permitting trusted CDNs, Unsplash imagery, and Open-Meteo)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: [
                "'self'", 
                "data:", 
                "blob:", 
                "https://res.cloudinary.com", 
                "https://images.unsplash.com", 
                "https://*.unsplash.com", 
                "https://*.googleusercontent.com"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'", 
                ...CLIENT_URL, 
                "https://accounts.google.com", 
                "https://api.open-meteo.com",
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

// General rate limiting
const limiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes (10 per 15 min)
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Extra strict rate limit for OTP/password reset (5 per 15 min)
const otpLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many reset attempts. Please wait and try again.' },
});
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/reset-password', otpLimiter);

// AI chat rate limit (30 per 15 min)
const aiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
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

// Enable Gzip/Brotli HTTP compression for ultra-fast payload delivery
app.use(compression());

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
            connected: isRedisConnected && redisClient.isOpen
        },
        system: {
            memoryRssMB: (mem.rss / 1024 / 1024).toFixed(1),
            heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1)
        },
        sockets: io ? io.engine.clientsCount : 0
    };

    const httpCode = isDbConnected ? 200 : 503;
    res.status(httpCode).json(healthStatus);
};

app.get('/healthz', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// ─── API Routes ────────────────────────────────────────────────────────
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

// ─── Production Static Serving (Single-Container & Monolith Deployments) ─
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
            if (filePath.includes(`${path.sep}assets${path.sep}`)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));

    // Client-side SPA routing fallback for all non-API GET requests
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/healthz') || req.path.startsWith('/livez')) {
            return next();
        }
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// ─── Error Handling ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ────────────────────────────────
export const startServer = async () => {
    try {
        const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10);
        const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE || '5', 10);

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'mountaineer-mallu',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize,
            minPoolSize,
            w: 'majority',
            retryWrites: true
        });
        console.log(`✅ MongoDB connected successfully [Pool: ${minPoolSize}-${maxPoolSize}] in Worker ${process.pid}`);

        mongoose.connection.on('error', (err) => logger.error(`[MongoDB] Connection error: ${err.message}`));
        mongoose.connection.on('disconnected', () => logger.warn('[MongoDB] Disconnected from server.'));
        mongoose.connection.on('reconnected', () => logger.info('[MongoDB] Reconnected successfully.'));

        httpServer.listen(PORT, () => {
            console.log(`🏔️  Worker ${process.pid} running API on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
            startCronJobs();
        });
    } catch (error) {
        console.error(`❌ Worker ${process.pid} MongoDB connection failed:`, error.message);
        process.exit(1);
    }
};

// ─── Graceful Shutdown Handler (Docker, K8s, Render, Railway, AWS) ────
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 [Worker ${process.pid}] Received ${signal}. Initiating graceful shutdown...`);
    
    httpServer.close(async () => {
        console.log(`  ✓ HTTP server stopped accepting connections.`);
        try {
            if (io) {
                io.close();
                console.log(`  ✓ Socket.io connections terminated.`);
            }
            if (isRedisConnected && redisClient.isOpen) {
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
