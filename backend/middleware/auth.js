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
            req.user = await User.findById(decoded.userId);
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

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Set JWT as HTTP-only cookie
export const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
