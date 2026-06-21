import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
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

// Set up Redis Client for Rate Limiting
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.warn(`Redis Client Error: ${err.message}`));
redisClient.connect().catch(console.error);

// Helmet with strict CSP (removing unsafe-inline for scripts where possible)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.googleusercontent.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", ...CLIENT_URL, "https://accounts.google.com"],
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
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes (10 per 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later.' },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
});
app.use('/api/auth/', authLimiter);

// Extra strict rate limit for OTP/password reset (5 per 15 min)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many reset attempts. Please wait and try again.' },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
});
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/reset-password', otpLimiter);

// AI chat rate limit (30 per 15 min)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'AI usage limit reached. Please wait a moment.' },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
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

app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID']
}));

// ─── Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        sockets: io.engine.clientsCount
    });
});

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

// ─── Error Handling ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ────────────────────────────────
export const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'mountaineer-mallu',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            w: 'majority',
            retryWrites: true
        });
        console.log(`✅ MongoDB connected successfully in Worker ${process.pid}`);

        httpServer.listen(PORT, () => {
            console.log(`🏔️  Worker ${process.pid} running API on port ${PORT}`);
            
            // Only start scheduled background jobs on the primary worker if possible, 
            // but for simplicity, we start it here. Ideally cron should run on a dedicated instance.
            startCronJobs();
        });
    } catch (error) {
        console.error(`❌ Worker ${process.pid} MongoDB connection failed:`, error.message);
        process.exit(1);
    }
};

// If this file is run directly (not via server.js), start it directly.
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
    startServer();
}

export default app;
