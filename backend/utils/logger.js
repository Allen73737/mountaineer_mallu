import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const customDevFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const transports = [];

// In non-containerized environments, also write to log files if directory writable
try {
    transports.push(
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/security.log', level: 'warn' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    );
} catch {
    // Ignore file write errors on ephemeral/read-only container runtimes
}

// Always stream to Console (stdout) for Docker, Kubernetes, AWS ALB, Render, Railway
if (process.env.NODE_ENV === 'production') {
    transports.push(
        new winston.transports.Console({
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        })
    );
} else {
    transports.push(
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customDevFormat
            )
        })
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    defaultMeta: { service: 'mountaineer-mallu-api' },
    transports
});

export default logger;

