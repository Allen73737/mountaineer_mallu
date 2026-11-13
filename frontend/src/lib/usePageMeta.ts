import { useEffect } from 'react';

const SITE = 'Mountaineer Mallu';
const ORIGIN = 'https://mountaineermallu.com';
const DEFAULT_DESCRIPTION = 'The premier Malayalee alpine hiking community in Europe. Conquer peaks, share stories, build bonds.';
const DEFAULT_IMAGE = `${ORIGIN}/og-default.jpg`;

interface PageMeta {
    title?: string;
    description?: string;
    image?: string;
    /** Path for the canonical URL; defaults to the current path */
    path?: string;
    type?: 'website' | 'article';
    jsonLd?: Record<string, unknown> | null;
    noindex?: boolean;
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.content = content;
};

/**
 * Per-page title, description, canonical, Open Graph / Twitter tags and JSON-LD.
 * Google renders JavaScript, so this is what it indexes; link previews in chat apps use the
 * backend /share/* pages instead (they don't run scripts).
 */
export const usePageMeta = ({ title, description, image, path, type = 'website', jsonLd, noindex }: PageMeta) => {
    const ld = jsonLd ? JSON.stringify(jsonLd) : '';
    useEffect(() => {
        const fullTitle = title ? `${title} · ${SITE}` : `${SITE} — Alpine Community`;
        const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 300);
        const url = `${ORIGIN}${path ?? window.location.pathname}`;
        const img = image || DEFAULT_IMAGE;

        document.title = fullTitle;
        setMeta('name', 'description', desc);
        setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:image', img);
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', desc);
        setMeta('name', 'twitter:image', img);

        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;

        let script: HTMLScriptElement | null = null;
        if (ld) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.dataset.pageMeta = 'true';
            script.textContent = ld;
            document.head.appendChild(script);
        }
        return () => { script?.remove(); };
    }, [title, description, image, path, type, ld, noindex]);
};
