import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIntro } from '../../lib/intro';

interface Flight {
    src: string;
    to: { left: number; top: number; width: number; height: number };
    from: { x: number; y: number; scale: number };
}

/**
 * Loader → navbar handoff. When the first-visit loader lifts, a copy of its centred logo flies
 * into the navbar's logomark and dissolves into it. Positioned on the target box and animated
 * from the source with transform only (translate + scale), so it never triggers layout.
 */
export const LogoHandoff = () => {
    const logoFrom = useIntro(s => s.logoFrom);
    const [flight, setFlight] = useState<Flight | null>(null);

    useEffect(() => {
        if (!logoFrom || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // The navbar renders both theme variants of the mark; pick the visible one
        const marks = document.querySelectorAll<HTMLImageElement>('header [aria-label="Mountaineer Mallu home"] img[alt*="Logomark"]');
        const target = Array.from(marks).map(m => m.getBoundingClientRect()).find(r => r.width > 0);
        if (!target) return;
        const { rect, src } = logoFrom;
        setFlight({
            src,
            to: { left: target.left, top: target.top, width: target.width, height: target.height },
            from: { x: rect.x - target.left, y: rect.y - target.top, scale: rect.width / target.width },
        });
    }, [logoFrom]);

    if (!flight) return null;

    return (
        <motion.img
            src={flight.src}
            alt=""
            aria-hidden="true"
            className="fixed z-[10001] pointer-events-none object-contain"
            style={{ ...flight.to, transformOrigin: '0 0' }}
            initial={{ x: flight.from.x, y: flight.from.y, scale: flight.from.scale, opacity: 1 }}
            animate={{ x: 0, y: 0, scale: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1], opacity: { duration: 1.45, times: [0, 0.78, 1] } }}
            decoding="sync"
            // Swap with the loader's own logo only once ours is painted — no blank frame in between
            onLoad={() => requestAnimationFrame(() => {
                const loaderLogo = document.querySelector<HTMLElement>('.mm-loader__logo');
                if (loaderLogo) loaderLogo.style.visibility = 'hidden'; // opacity would lose to the loader's CSS animation
            })}
            onAnimationComplete={() => setFlight(null)}
        />
    );
};
