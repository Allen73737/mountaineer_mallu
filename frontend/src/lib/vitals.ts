import { API_URL } from './constants';

/**
 * Real-user speed monitoring: Core Web Vitals measured in visitors' own browsers and phones, on their
 * real networks, sent to the API (backend/routes/vitals.js) where admins can read the p75.
 *
 * Built on the browser's PerformanceObserver, so it adds no library to the bundle. Production only;
 * VITE_RUM_SAMPLE (0–1, default 1) reports from a fraction of visits, and VITE_RUM=false turns it off.
 *
 * - LCP  largest contentful paint (loading)       - CLS  cumulative layout shift (visual stability)
 * - INP  slowest interaction latency (approx.)    - FCP / TTFB  first paint and server response
 */
type Metric = { name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB'; value: number };

export const initVitals = () => {
    if (!import.meta.env.PROD || import.meta.env.VITE_RUM === 'false' || typeof PerformanceObserver === 'undefined') return;
    const sample = Number(import.meta.env.VITE_RUM_SAMPLE ?? 1);
    if (Math.random() >= sample) return;

    const values = new Map<Metric['name'], number>();
    const observe = (type: string, cb: (entries: any[]) => void, opts: Record<string, unknown> = {}) => {
        try {
            new PerformanceObserver(list => cb(list.getEntries())).observe({ type, buffered: true, ...opts } as PerformanceObserverInit);
        } catch { /* entry type not supported by this browser */ }
    };

    observe('largest-contentful-paint', entries => {
        const last = entries[entries.length - 1];
        if (last) values.set('LCP', last.startTime);
    });
    observe('paint', entries => {
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) values.set('FCP', fcp.startTime);
    });

    // CLS: the worst burst ("session window") of layout shifts not caused by user input
    let windowValue = 0, windowStart = 0, windowLast = 0;
    observe('layout-shift', entries => {
        for (const e of entries) {
            if (e.hadRecentInput) continue;
            if (windowValue && e.startTime - windowLast < 1000 && e.startTime - windowStart < 5000) {
                windowValue += e.value;
            } else {
                windowValue = e.value;
                windowStart = e.startTime;
            }
            windowLast = e.startTime;
            values.set('CLS', Math.max(values.get('CLS') ?? 0, windowValue));
        }
    });

    // INP (approximation): the slowest interaction seen on this page view
    observe('event', entries => {
        for (const e of entries) {
            if (e.interactionId) values.set('INP', Math.max(values.get('INP') ?? 0, e.duration));
        }
    }, { durationThreshold: 40 });

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) values.set('TTFB', Math.max(0, nav.responseStart - nav.startTime));

    let sent = false;
    const send = () => {
        if (sent || !values.size) return;
        sent = true;
        const conn = (navigator as any).connection?.effectiveType || '';
        const page = location.pathname.replace(/[a-f0-9]{24}/gi, ':id');
        const body = JSON.stringify([...values].map(([name, value]) => ({ name, value, page, conn })));
        // text/plain keeps the beacon a "simple" request (no CORS preflight)
        const blob = new Blob([body], { type: 'text/plain' });
        if (!navigator.sendBeacon?.(`${API_URL}/api/vitals`, blob)) {
            fetch(`${API_URL}/api/vitals`, { method: 'POST', body, keepalive: true, credentials: 'include' }).catch(() => {});
        }
    };
    // Report once, when the visitor leaves or backgrounds the tab: by then LCP, CLS and INP are final
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') send(); });
    window.addEventListener('pagehide', send, { once: true });
};
