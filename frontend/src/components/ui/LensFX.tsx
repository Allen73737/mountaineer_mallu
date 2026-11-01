import { useEffect, useRef } from 'react';
import { cancelFrame, frame } from 'framer-motion';
import { useQuality } from '../../lib/quality';

/**
 * Lens response to camera speed. Fast scrolling feeds a smoothed 0 → 1 value that becomes chromatic
 * fringing at the frame edges, an RGB split on the section headlines on screen, a heavier vignette and
 * a little extra grain — like a real lens under motion. High quality tier only.
 *
 * Performance: the value is written only to the handful of elements that use it (the fringe, the
 * grain layer, the vignette and the headlines currently in view) — never to <html>, where an inherited
 * custom property would force a style recalculation of the whole document on every frame. At rest
 * every layer is display:none and nothing runs.
 */
export const LensFX = () => {
    const tier = useQuality(s => s.tier);
    const fringeRef = useRef<HTMLDivElement>(null);
    const grainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fringe = fringeRef.current, grain = grainRef.current;
        if (tier !== 'high' || !fringe || !grain || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let lastY = window.scrollY;
        let lastT = performance.now();
        let target = 0;
        let value = 0;
        let running = false;
        let vignette: HTMLElement | null = null;
        let titles: HTMLElement[] = [];

        // Picked once when the lens starts moving: only headlines on screen get the split
        const begin = () => {
            vignette = document.querySelector<HTMLElement>('.cinema-vignette');
            const vh = window.innerHeight;
            titles = Array.from(document.querySelectorAll<HTMLElement>('.cine-title')).filter(el => {
                const r = el.getBoundingClientRect();
                return r.bottom > -vh * 0.5 && r.top < vh * 1.5;
            });
            fringe.style.display = 'block';
            grain.style.display = 'block';
            titles.forEach(el => el.classList.add('lens-split'));
        };
        const end = () => {
            fringe.style.display = 'none';
            grain.style.display = 'none';
            if (vignette) { vignette.style.opacity = ''; vignette.style.transform = ''; }
            titles.forEach(el => { el.classList.remove('lens-split'); el.style.removeProperty('--lens-v'); });
            titles = [];
        };
        const apply = (v: number) => {
            const s = v.toFixed(3);
            fringe.style.setProperty('--lens-v', s);
            fringe.style.opacity = s;
            grain.style.opacity = (v * 0.05).toFixed(3);
            if (vignette) {
                vignette.style.opacity = (1 + v * 0.8).toFixed(3);
                vignette.style.transform = `scale(${(1 - v * 0.04).toFixed(4)})`;
            }
            titles.forEach(el => el.style.setProperty('--lens-v', s));
        };

        const tick = () => {
            // Attack fast, release slowly
            value += (target - value) * (target > value ? 0.35 : 0.08);
            target *= 0.9;
            if (value < 0.01) {
                value = 0;
                end();
                running = false;
                cancelFrame(tick);
                return;
            }
            apply(value);
        };

        const onScroll = () => {
            const now = performance.now();
            const dt = Math.max(1, now - lastT);
            const speed = Math.abs(window.scrollY - lastY) / dt; // px per ms
            lastY = window.scrollY;
            lastT = now;
            // ~1.2 px/ms is a quick flick; ease in so slow reading scrolls stay clean
            target = Math.min(1, Math.max(0, (speed - 0.25) / 1.6));
            if (!running && target > 0.01) {
                running = true;
                // Look up on-screen headlines in framer's read phase, then animate in its render phase
                // every frame until the lens settles — never interleaving with framer's scroll reads
                frame.read(begin);
                frame.render(tick, true);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelFrame(begin);
            cancelFrame(tick);
            end();
        };
    }, [tier]);

    if (tier !== 'high') return null;
    return (
        <>
            <div ref={fringeRef} aria-hidden="true" className="lens-fringe" />
            <div ref={grainRef} aria-hidden="true" className="lens-grain" />
        </>
    );
};
