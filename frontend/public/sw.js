/* Mountaineer Mallu service worker
 *
 * - App shell (index.html) is network-first with a cached fallback, so the site opens offline.
 * - Hashed build assets (/assets/*) are cache-first: their names change on every deploy.
 * - Photos from Unsplash/Cloudinary are stale-while-revalidate with a size cap.
 * - A few read-only API calls (events, my expeditions, passport, stories) are network-first with a
 *   cached fallback, so trip details still open on the mountain with no signal.
 * - Everything else (auth, writes, AI, sockets) always goes straight to the network.
 */
const VERSION = 'mm-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const IMAGES = `${VERSION}-images`;
const DATA = `${VERSION}-data`;
const MAX_IMAGES = 120;

const OFFLINE_API = [/\/api\/events(\/[a-f0-9]{24})?(\?|$)/, /\/api\/users\/me\/expeditions/, /\/api\/users\/me\/passport/, /\/api\/stories(\/[a-f0-9]{24})?(\?|$)/, /\/api\/settings(\?|$)/];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(SHELL).then(c => c.addAll(['/', '/manifest.webmanifest'])).catch(() => {}));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

const trim = async (name, max) => {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
};

const networkFirst = async (request, cacheName, fallbackUrl) => {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(request);
        if (res.ok) cache.put(fallbackUrl || request, res.clone());
        return res;
    } catch {
        const hit = await cache.match(fallbackUrl || request);
        if (hit) return hit;
        throw new Error('offline');
    }
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    // Page navigations → app shell
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, SHELL, '/').catch(() => caches.match('/')));
        return;
    }

    // Build assets: immutable, cache-first
    if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
        event.respondWith(caches.open(ASSETS).then(async cache => {
            const hit = await cache.match(request);
            if (hit) return hit;
            const res = await fetch(request);
            if (res.ok) cache.put(request, res.clone());
            return res;
        }));
        return;
    }

    // Remote photos: stale-while-revalidate
    if (/images\.unsplash\.com|res\.cloudinary\.com/.test(url.hostname)) {
        event.respondWith(caches.open(IMAGES).then(async cache => {
            const hit = await cache.match(request);
            const refresh = fetch(request).then(res => {
                if (res.ok || res.type === 'opaque') { cache.put(request, res.clone()); trim(IMAGES, MAX_IMAGES); }
                return res;
            }).catch(() => hit);
            return hit || refresh;
        }));
        return;
    }

    // Selected read-only API data for offline trips
    if (url.pathname.startsWith('/api/') && OFFLINE_API.some(re => re.test(url.pathname + url.search))) {
        event.respondWith(networkFirst(request, DATA));
    }
});
