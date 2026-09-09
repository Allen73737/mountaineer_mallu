/**
 * Enterprise Environment Variable Validator
 * Validates critical production configurations at server startup to prevent insecure or broken states.
 */

const INSECURE_DEFAULT_SECRETS = [
    'your_jwt_secret_here_change_this_in_production',
    'secret',
    'password',
    '123456',
    'default_secret'
];

export function validateEnv() {
    const isProduction = process.env.NODE_ENV === 'production';
    const errors = [];
    const warnings = [];

    // Critical Database Connection
    if (!process.env.MONGODB_URI) {
        errors.push('MONGODB_URI is required but missing.');
    }

    // Authentication Security
    if (!process.env.JWT_SECRET) {
        errors.push('JWT_SECRET is required but missing.');
    } else {
        if (INSECURE_DEFAULT_SECRETS.includes(process.env.JWT_SECRET.trim())) {
            const msg = 'JWT_SECRET is set to an insecure default placeholder value!';
            if (isProduction) errors.push(msg);
            else warnings.push(msg);
        }
        if (process.env.JWT_SECRET.length < 32 && isProduction) {
            warnings.push('JWT_SECRET is shorter than 32 characters in production. Consider using a 256-bit cryptographically secure string.');
        }
    }

    // CORS & Allowed Origins
    if (!process.env.CLIENT_URL) {
        warnings.push('CLIENT_URL not set; defaulting to local origins.');
    }

    // Cloudinary for media uploads
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        warnings.push('Cloudinary credentials incomplete; media uploads may fail.');
    }

    // Redis
    if (!process.env.REDIS_URL) {
        warnings.push('REDIS_URL not set; rate-limiting and cache will use in-memory store.');
    }

    // Output Diagnostics
    if (warnings.length > 0) {
        console.warn('⚠️  [Environment Configuration Warnings]:');
        warnings.forEach(w => console.warn(`   • ${w}`));
    }

    if (errors.length > 0) {
        console.error('❌ [FATAL: Environment Configuration Errors]:');
        errors.forEach(e => console.error(`   • ${e}`));
        if (isProduction) {
            console.error('Server execution halted due to critical configuration errors.');
            process.exit(1);
        }
    }

    console.log(`🔒 Environment configuration validated successfully for [${process.env.NODE_ENV || 'development'}] mode.`);
}
