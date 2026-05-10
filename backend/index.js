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
import { randomUUID } from 'crypto';
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
import { errorHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './services/cron.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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

// Helmet with strict CSP
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.googleusercontent.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", CLIENT_URL, "https://accounts.google.com"],
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
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes (10 per 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/', authLimiter);

// Extra strict rate limit for OTP/password reset (5 per 15 min)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many reset attempts. Please wait and try again.' }
});
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/reset-password', otpLimiter);

// AI chat rate limit (30 per 15 min)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'AI usage limit reached. Please wait a moment.' }
});
app.use('/api/ai/', aiLimiter);

// ─── Body Parsing & CORS ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization — NoSQL injection, XSS, prototype pollution
app.use(sanitizeInputs);

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

// ─── Error Handling ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ────────────────────────────────
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'mountaineer-mallu',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 50, // Premium: handle more concurrent connections
            w: 'majority',
            retryWrites: true
        });
        console.log('✅ MongoDB connected successfully');

        httpServer.listen(PORT, () => {
            console.log(`🏔️  Mountaineer Mallu API running on port ${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔌 Socket.io ready on port ${PORT}`);
            
            // Start scheduled background jobs
            startCronJobs();
        });
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

startServer();

export default app;
