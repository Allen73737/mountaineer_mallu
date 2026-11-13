/**
 * Error tracking (Sentry) and privacy-friendly page analytics (Plausible-compatible).
 * Both are off unless their env variable is set at build time, and neither loads any code or makes
 * any request until then, so the default build is unchanged:
 *   VITE_SENTRY_DSN=https://...@....ingest.sentry.io/...
 *   VITE_ANALYTICS_DOMAIN=mountaineermallu.com   (optional VITE_ANALYTICS_SRC for a self-hosted script)
 */
type SentryLike = { captureException: (e: unknown, ctx?: { extra?: Record<string, unknown> }) => unknown };
let sentry: SentryLike | null = null;
const queued: [unknown, Record<string, unknown>?][] = [];

export const initMonitoring = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
    if (dsn) {
        import('@sentry/react').then(Sentry => {
            Sentry.init({
                dsn,
                environment: import.meta.env.MODE,
                // Errors only: no tracing, no session replay, no personal data
                tracesSampleRate: 0,
                sendDefaultPii: false,
            });
            sentry = Sentry;
            queued.splice(0).forEach(([e, extra]) => Sentry.captureException(e, { extra }));
        }).catch(() => { /* blocked by an ad blocker: the site works without it */ });
    }

    const domain = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined;
    const doNotTrack = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';
    if (domain && !doNotTrack && import.meta.env.PROD) {
        const s = document.createElement('script');
        s.defer = true;
        s.dataset.domain = domain;
        s.src = (import.meta.env.VITE_ANALYTICS_SRC as string | undefined) || 'https://plausible.io/js/script.js';
        document.head.appendChild(s);
    }
};

/** Report a caught error (error boundaries). Safe to call when tracking is off. */
export const captureError = (error: unknown, extra?: Record<string, unknown>) => {
    if (!import.meta.env.VITE_SENTRY_DSN) return;
    if (sentry) sentry.captureException(error, { extra });
    else if (queued.length < 10) queued.push([error, extra]);
};
