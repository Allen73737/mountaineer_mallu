import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT from HTTP-only cookie and attach user to request
export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        // Verify token version for session invalidation
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ error: 'Session invalidated. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token. Please log in again.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        next(error);
    }
};

// Optional auth — attach user if token exists, don't block if not
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user && decoded.tokenVersion === user.tokenVersion) {
                req.user = user;
            }
        }
    } catch {
        // Silently continue without auth
    }
    next();
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient privileges for this operation.' });
        }
        next();
    };
};

// Demo Account Interceptor
export const blockDemoUsers = (req, res, next) => {
    if (req.user && req.user.email === 'demo@mountaineermallu.com') {
        if (req.method !== 'GET') {
            return res.status(403).json({ error: 'Action not permitted for demo accounts.' });
        }
    }
    next();
};

// Permission-based authorization (for admins with specific permissions)
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        // SuperAdmin always has all permissions
        if (req.user.role === 'superadmin') {
            return next();
        }

        // Admin needs specific permission
        if (req.user.role === 'admin' && req.user.permissions[permission]) {
            return next();
        }

        return res.status(403).json({ error: `Permission '${permission}' required for this operation.` });
    };
};

// Generate JWT token — 30 days for persistent login
export const generateToken = (userId, tokenVersion = 0) => {
    return jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

// Set JWT as HTTP-only cookie — 30 day persistent login
export const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
    });
};

// Clear JWT cookie
export const clearTokenCookie = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
        path: '/'
    });
};
