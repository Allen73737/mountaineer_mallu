import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useQuality } from '../../lib/quality';

// The page as one day on the mountain: dawn at the hero, bright midday through the middle,
// golden hour, dusk, then night by the footer. One colour per stop, evenly spread over page scroll.
const TINT = ['#F2A07A', '#FFD9B8', '#BFD6EA', '#F3B06A', '#B07FA8', '#3A4E8C', '#0E1A3A'];
const SKY = ['#FFB48A', '#FFE7CF', '#D7E8F6', '#FFC27A', '#C98FB0', '#4A5FA8', '#1B2A5C'];
const STEPS = TINT.length - 1;

// A strip (STEPS + 1) screens tall with each stop centred on its own screen; sliding it up by one
// screen per step shows the right colour without ever repainting
const strip = (colors: string[]) => `linear-gradient(to bottom, ${colors.map((c, i) => `${c} ${((100 * i + 50) / (STEPS + 1)).toFixed(2)}%`).join(', ')})`;
const TINT_STRIP = strip(TINT);
const SKY_STRIP = strip(SKY);

/**
 * Global colour grade on the home page. A faint fixed wash whose colour follows the scroll through
 * the day, plus a sky glow falling from the top edge.
 *
 * Performance: each layer is painted once as a tall gradient strip and only translated with the
 * scroll (compositor-only — no repaint, no style work per frame). Plain alpha on purpose: a
 * full-screen mix-blend-mode layer makes the browser re-blend the entire page on every scroll frame.
 * Skipped on the low quality tier and for reduced motion.
 */
export const DayCycleGrade = () => {
    const reduce = useReducedMotion();
    const tier = useQuality(s => s.tier);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, p => `${-p * STEPS * 100}vh`);

    if (reduce || tier === 'low') return null;

    const layer = { height: `${(STEPS + 1) * 100}vh` };
    return (
        <div aria-hidden="true" className="fixed inset-0 z-[9996] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 overflow-hidden opacity-[0.06] dark:opacity-[0.07]">
                <motion.div style={{ ...layer, y, backgroundImage: TINT_STRIP }} className="absolute inset-x-0 top-0 will-change-transform" />
            </div>
            {/* Sky glow: the same strip seen through a static radial window at the top of the frame */}
            <div className="absolute inset-0 overflow-hidden opacity-[0.14] dark:opacity-[0.1] [mask-image:radial-gradient(110%_45%_at_50%_-12%,#000,transparent_72%)] [-webkit-mask-image:radial-gradient(110%_45%_at_50%_-12%,#000,transparent_72%)]">
                <motion.div style={{ ...layer, y, backgroundImage: SKY_STRIP }} className="absolute inset-x-0 top-0 will-change-transform" />
            </div>
        </div>
    );
};
