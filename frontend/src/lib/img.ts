/**
 * Responsive variants for the two image CDNs the site uses. Both resize and pick a modern format
 * (WebP/AVIF) on the fly, so a phone downloads a ~480 px image instead of the full-size original.
 * Unknown hosts are returned untouched.
 */
const WIDTHS = [480, 768, 1080, 1440, 1920];

const unsplash = (url: string, w: number) => {
    const u = new URL(url);
    u.searchParams.set('w', String(w));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', u.searchParams.get('fit') || 'crop');
    u.searchParams.set('q', u.searchParams.get('q') && Number(u.searchParams.get('q')) < 75 ? u.searchParams.get('q')! : '72');
    return u.toString();
};

const cloudinary = (url: string, w: number) =>
    url.replace(/\/upload\/(?:(?:[a-z]{1,3}_[^/,]+,?)+\/)?/, `/upload/w_${w},c_limit,f_auto,q_auto/`);

const variant = (url: string, w: number): string | null => {
    try {
        if (url.includes('images.unsplash.com')) return unsplash(url, w);
        if (url.includes('res.cloudinary.com') && url.includes('/upload/')) return cloudinary(url, w);
    } catch { /* malformed URL */ }
    return null;
};

/** `srcSet` for a CDN image, or undefined when the host can't resize. */
export const srcSetFor = (url?: string, widths = WIDTHS): string | undefined => {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) return undefined;
    const parts = widths.map(w => { const v = variant(url, w); return v ? `${v} ${w}w` : null; }).filter(Boolean);
    return parts.length ? parts.join(', ') : undefined;
};

/** A single resized URL (e.g. thumbnails, avatars). */
export const resized = (url: string | undefined, width: number) => (url ? variant(url, width) ?? url : url);
