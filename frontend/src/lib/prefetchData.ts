import { prefetchRequest } from './api';

/**
 * When a pointer rests on (or a finger touches) a link to one of the main pages, start fetching that
 * page's data. The response cache in lib/api holds it, so the page usually renders with its content
 * as the route transition finishes, instead of a skeleton. Params must match what each page requests.
 */
const PAGE_DATA: Record<string, [string, Record<string, number>?]> = {
    '/events': ['/events', { page: 1, limit: 20 }],
    '/stories': ['/stories', { page: 1, limit: 12 }],
    '/gallery': ['/gallery', { page: 1, limit: 50 }],
    '/shop': ['/merchandise'],
    '/reviews': ['/reviews'],
    '/team': ['/pillars'],
    '/community': ['/community/groups'],
};
const DETAIL = /^\/(events|stories)\/([a-f0-9]{24})$/;

const warmed = new Set<string>();

const warm = (href: string) => {
    let path: string;
    try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        path = url.pathname.replace(/\/$/, '') || '/';
    } catch { return; }
    if (warmed.has(path)) return;
    const detail = DETAIL.exec(path);
    const target = detail ? [`/${detail[1]}/${detail[2]}`] as const : PAGE_DATA[path];
    if (!target) return;
    warmed.add(path);
    // Let the cache's own expiry decide freshness; allow a re-warm a minute later
    setTimeout(() => warmed.delete(path), 60_000);
    prefetchRequest(target[0], target[1]);
};

let timer = 0;
const onOver = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    window.clearTimeout(timer);
    // A short dwell, so sweeping the cursor across the menu doesn't fire every link
    timer = window.setTimeout(() => warm(a.href), e.type === 'touchstart' ? 0 : 80);
};

export const startDataPrefetch = () => {
    // Respect data saver / slow connections
    const conn = (navigator as any).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType || '')) return () => {};
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('touchstart', onOver, { passive: true });
    return () => {
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('touchstart', onOver);
    };
};
