/**
 * Security Middleware: Input Sanitization
 * 
 * Protects against:
 * 1. MongoDB NoSQL Injection — strips $ operators from query objects
 * 2. XSS — escapes HTML entities in string values
 * 3. Prototype Pollution — strips __proto__, constructor, prototype keys
 */

// HTML entity escaping for XSS prevention
const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

// Dangerous keys for prototype pollution
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Recursively sanitize an object
const sanitizeObject = (obj, depth = 0) => {
    // Prevent infinite recursion (max depth 10)
    if (depth > 10) return obj;

    if (obj === null || obj === undefined) return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, depth + 1));
    }

    // Handle objects
    if (typeof obj === 'object' && !(obj instanceof Date)) {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
            // Block prototype pollution
            if (DANGEROUS_KEYS.has(key)) continue;

            // Block MongoDB injection operators (keys starting with $)
            if (key.startsWith('$')) continue;

            sanitized[key] = sanitizeObject(obj[key], depth + 1);
        }
        return sanitized;
    }

    // Escape HTML in strings
    if (typeof obj === 'string') {
        return escapeHtml(obj);
    }

    return obj;
};

/**
 * Middleware that sanitizes req.body, req.query, and req.params
 * to prevent NoSQL injection, XSS, and prototype pollution.
 * 
 * Skips sanitization for file upload routes (FormData).
 */
export const sanitizeInputs = (req, res, next) => {
    // Skip file uploads — FormData is handled by multer
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return next();
    }

    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    next();
};

export default sanitizeInputs;
