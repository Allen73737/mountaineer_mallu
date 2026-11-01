import { useEffect } from 'react';
import { cancelFrame, frame } from 'framer-motion';

// Element class → CSS variable it receives, and how much of the viewport height the 0 → 1 ramp spans
const TARGETS = [
    { selector: '.cine-title', prop: '--cine', span: 0.45 },   // headings: focus pull (index.css)
    { selector: '.develop-img', prop: '--dev', span: 0.6 },    // photos: darkroom "develop" (index.css)
    { selector: '.reveal-img', prop: '--rev', span: 0.55 },    // image frames: clip-path open + settle (index.css)
] as const;
const SELECTOR = TARGETS.map(t => t.selector).join(',');

/**
 * Drives the scroll-linked `.cine-title` focus pull, `.develop-img` photo develop and `.reveal-img`
 * reveal (see index.css). For each element it writes a 0 → 1 progress into a CSS variable as the
 * element travels from the bottom of the viewport up by `span` × viewport height; CSS maps that to
 * blur / mask / colour. Done from page scroll rather than CSS `view()` timelines because those bind to
 * the nearest overflow-hidden ancestor, which most sections have.
 *
 * Cost control: only elements near the viewport (IntersectionObserver) are measured on a scroll frame;
 * one leaving the viewport gets its resting value once. New elements (lazy sections, route changes)
 * are picked up by a MutationObserver that ignores text-only changes (live counters update text every
 * frame). Measuring runs in framer-motion's batched read phase and writing in its render phase, so it
 * never interleaves with framer's own scroll measurements (no forced layouts). A value is only
 * written when it changes — no React re-renders.
 */
export const CinematicTitles = () => {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const last = new WeakMap<HTMLElement, string>();
        const near = new Set<HTMLElement>();
        const known = new Set<HTMLElement>();
        const configFor = (el: HTMLElement) => TARGETS.filter(t => el.matches(t.selector));

        const write = (el: HTMLElement, prop: string, value: string) => {
            const key = `${prop}:${value}`;
            if (last.get(el) === key) return;
            last.set(el, key);
            el.style.setProperty(prop, value);
            // Fully revealed: data-settled drops the filter / clip entirely (blur(0) still costs a filter layer)
            el.toggleAttribute('data-settled', value === '1.000');
        };

        let scheduled = false;
        let reads: { el: HTMLElement; prop: string; value: string }[] = [];
        const measure = () => {
            const vh = window.innerHeight;
            reads = [];
            near.forEach(el => {
                const top = el.getBoundingClientRect().top;
                for (const { prop, span } of configFor(el)) {
                    reads.push({ el, prop, value: Math.min(1, Math.max(0, (vh - top) / (vh * span))).toFixed(3) });
                }
            });
        };
        const apply = () => {
            scheduled = false;
            for (const { el, prop, value } of reads) write(el, prop, value);
            reads = [];
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            frame.read(measure);
            frame.render(apply);
        };

        const io = new IntersectionObserver(entries => {
            for (const e of entries) {
                const el = e.target as HTMLElement;
                if (e.isIntersecting) {
                    near.add(el);
                    // The entry already carries the box: set the value now rather than a frame later
                    const vh = window.innerHeight, top = e.boundingClientRect.top;
                    const values = configFor(el).map(({ prop, span }) => [prop, Math.min(1, Math.max(0, (vh - top) / (vh * span))).toFixed(3)] as const);
                    frame.render(() => { for (const [prop, value] of values) write(el, prop, value); });
                } else {
                    near.delete(el);
                    // Off screen: park it at its resting state (revealed if above the viewport, hidden if below)
                    const resting = e.boundingClientRect.top < 0 ? '1.000' : '0.000';
                    frame.render(() => { for (const { prop } of configFor(el)) write(el, prop, resting); });
                }
            }
            schedule();
        }, { rootMargin: '15% 0px 15% 0px' });

        const collect = () => {
            document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
                if (known.has(el)) return;
                known.add(el);
                io.observe(el);
            });
            known.forEach(el => {
                if (el.isConnected) return;
                known.delete(el); near.delete(el); io.unobserve(el);
            });
        };
        collect();

        // Sections mount lazily after route transitions: re-scan when elements come or go (not on text updates)
        let scan = 0;
        const hasElements = (list: NodeList) => {
            for (let i = 0; i < list.length; i++) if (list[i].nodeType === 1) return true;
            return false;
        };
        const mo = new MutationObserver(records => {
            if (scan) return;
            if (!records.some(r => hasElements(r.addedNodes) || hasElements(r.removedNodes))) return;
            scan = requestAnimationFrame(() => { scan = 0; collect(); });
        });
        mo.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });

        return () => {
            cancelFrame(measure);
            cancelFrame(apply);
            if (scan) cancelAnimationFrame(scan);
            io.disconnect();
            mo.disconnect();
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, []);

    return null;
};
