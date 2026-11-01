import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useMorph } from '../../lib/morph';

const EASE = [0.76, 0, 0.24, 1] as const;
// The destination page fades in ~1 s after navigation (RouteTransition); hold the image at least that long
const MIN_HOLD_MS = 1300;
const MAX_HOLD_MS = 3200;

/**
 * Shared-element page transition. A copy of the clicked card's image lifts off at the card's exact
 * position, grows to fill the screen (dimming to the detail hero's grade) while the old page leaves
 * underneath, then dissolves once the detail page's hero image has loaded — so the photo you clicked
 * becomes the page you land on.
 */
export const MorphOverlay = () => {
    const active = useMorph(s => s.active);
    const landed = useMorph(s => s.landed);
    const clear = useMorph(s => s.clear);
    const controls = useAnimationControls();
    const [flown, setFlown] = useState(false);
    const [startedAt, setStartedAt] = useState(0);

    useEffect(() => {
        if (!active) return;
        setFlown(false);
        setStartedAt(performance.now());
        const { rect } = active;
        controls.set({ left: rect.x, top: rect.y, width: rect.width, height: rect.height, borderRadius: 18, opacity: 1, filter: 'brightness(1)' });
        controls.start({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, filter: 'brightness(0.55)', transition: { duration: 0.95, ease: EASE } })
            .then(() => setFlown(true));
        const fallback = window.setTimeout(() => useMorph.getState().land(), MAX_HOLD_MS);
        return () => window.clearTimeout(fallback);
    }, [active, controls]);

    useEffect(() => {
        if (!active || !landed || !flown) return;
        const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - startedAt));
        const t = window.setTimeout(() => {
            controls.start({ opacity: 0, transition: { duration: 0.8, ease: 'easeOut' } }).then(clear);
        }, wait);
        return () => window.clearTimeout(t);
    }, [active, landed, flown, startedAt, controls, clear]);

    if (!active) return null;
    return (
        <motion.div aria-hidden="true" animate={controls} className="fixed z-[9991] overflow-hidden pointer-events-none will-change-[left,top,width,height]">
            <img src={active.src} alt="" className="w-full h-full object-cover" draggable={false} />
        </motion.div>
    );
};
