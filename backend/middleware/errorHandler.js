export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ error: `An account with this ${field} already exists.` });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format.' });
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size exceeded.' });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field.' });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Internal server error.';

    res.status(statusCode).json({ error: message });
};

// Helper to create custom errors
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
