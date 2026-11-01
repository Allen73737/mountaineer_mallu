/**
 * Remembers the scroll position of every history entry (keyed by react-router's location.key, which
 * lives in history.state and so survives a refresh). Positions are kept in sessionStorage, so back /
 * forward and reloads land where the visitor left off, while fresh navigations still start at the top.
 */
const STORE = 'mm-scroll-positions';
const MAX_ENTRIES = 60;

const read = (): Record<string, number> => {
    try { return JSON.parse(sessionStorage.getItem(STORE) || '{}'); } catch { return {}; }
};

export const saveScroll = (key: string, y: number) => {
    try {
        const all = read();
        delete all[key];
        all[key] = Math.max(0, Math.round(y));
        const keys = Object.keys(all);
        if (keys.length > MAX_ENTRIES) keys.slice(0, keys.length - MAX_ENTRIES).forEach(k => delete all[k]);
        sessionStorage.setItem(STORE, JSON.stringify(all));
    } catch { /* storage blocked: positions simply aren't remembered */ }
};

export const readScroll = (key: string): number | null => {
    const y = read()[key];
    return typeof y === 'number' && y > 0 ? y : null;
};

/**
 * Scroll to `y` once the page is tall enough to reach it (lazy sections, images and pinned scenes keep
 * growing the page after mount), then correct once more after late layout shifts.
 */
export const scrollToWhenReady = (y: number, scroll: (y: number) => void, timeoutMs = 4000) => {
    const start = performance.now();
    let cancelled = false;
    const attempt = () => {
        if (cancelled) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max >= y - 2 || performance.now() - start > timeoutMs) {
            scroll(Math.min(y, Math.max(0, max)));
            window.setTimeout(() => {
                if (!cancelled && Math.abs(window.scrollY - y) > 4 && document.documentElement.scrollHeight - window.innerHeight >= y - 2) scroll(y);
            }, 350);
            return;
        }
        window.setTimeout(attempt, 80);
    };
    requestAnimationFrame(attempt);
    return () => { cancelled = true; };
};
