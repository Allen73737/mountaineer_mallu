// Error tracking (Sentry). Off unless SENTRY_DSN is set, and the SDK is only loaded in that case,
// so local development pays no memory or start-up cost for it.
let sentry = null;

export const initMonitoring = async () => {
    if (!process.env.SENTRY_DSN || sentry) return;
    try {
        const Sentry = await import('@sentry/node');
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            // Errors only; no performance tracing, no request bodies or cookies
            tracesSampleRate: 0,
            sendDefaultPii: false,
        });
        sentry = Sentry;
        console.log('🛰️  Error tracking enabled (Sentry).');
    } catch (err) {
        console.warn(`Error tracking not started: ${err.message}`);
    }
};

/** Report an unexpected error. Safe to call when monitoring is off. */
export const captureError = (err, context = {}) => {
    if (!sentry) return;
    sentry.withScope(scope => {
        for (const [k, v] of Object.entries(context)) scope.setExtra(k, v);
        sentry.captureException(err);
    });
};
