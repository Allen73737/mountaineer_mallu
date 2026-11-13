// Post-build SEO step (runs after `vite build`).
//
// 1. Pre-renders one HTML file per public section (dist/stories.html, dist/events.html, …) — the same
//    app shell, but with that section's own <title>, description, canonical and share tags baked in.
//    Crawlers and chat-app link previews that don't run JavaScript then see the right page.
// 2. If an API URL is configured, replaces the static sitemap with the live one from the backend
//    (every approved story and expedition). Failure here never fails the build.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const ORIGIN = 'https://mountaineermallu.com';

const PAGES = {
    stories: ['Expedition Stories', 'First-hand chronicles from Malayalee climbers across the Alps — routes, summits, setbacks and the people on the rope.'],
    events: ['Upcoming Expeditions', 'Join a guided Alpine expedition, skills training day, meetup or cultural gathering with Mountaineer Mallu.'],
    gallery: ['Gallery', 'Photos and films from the summits, ridges and huts — captured by the Mountaineer Mallu community.'],
    community: ['Community', 'Find your rope team. Join regional groups of Malayalee hikers and climbers across Europe.'],
    team: ['The Team', 'Meet the guides, medics and organisers who lead Mountaineer Mallu expeditions.'],
    reviews: ['Reviews', 'What members say about climbing with Mountaineer Mallu.'],
    shop: ['Shop', 'Expedition gear and apparel from Mountaineer Mallu.'],
    contact: ['Contact', 'Questions about an expedition, partnerships or press — get in touch with Mountaineer Mallu.'],
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setTag = (html, re, replacement) => (re.test(html) ? html.replace(re, replacement) : html);

const shell = await readFile(path.join(dist, 'index.html'), 'utf8');

for (const [slug, [title, description]] of Object.entries(PAGES)) {
    const full = `${title} · Mountaineer Mallu`;
    const url = `${ORIGIN}/${slug}`;
    let html = shell;
    html = setTag(html, /<title>[^<]*<\/title>/, `<title>${esc(full)}</title>`);
    html = setTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);
    html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
    html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(full)}" />`);
    html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`);
    html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
    html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(full)}" />`);
    html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(description)}" />`);
    await writeFile(path.join(dist, `${slug}.html`), html);
}
console.log(`✓ Pre-rendered ${Object.keys(PAGES).length} section pages with their own meta tags`);

const api = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');
if (api) {
    try {
        const res = await fetch(`${api}/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
        const xml = await res.text();
        if (res.ok && xml.includes('<urlset')) {
            await writeFile(path.join(dist, 'sitemap.xml'), xml);
            console.log(`✓ Sitemap refreshed from ${api} (${(xml.match(/<url>/g) || []).length} URLs)`);
        } else {
            console.warn(`! Sitemap: ${api} answered ${res.status}; keeping the static sitemap`);
        }
    } catch (err) {
        console.warn(`! Sitemap: could not reach ${api} (${err.message}); keeping the static sitemap`);
    }
}
