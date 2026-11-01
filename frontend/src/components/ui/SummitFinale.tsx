import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Odometer } from './Odometer';
import { peaksData } from '../../data/peaks';
import { useAuthStore } from '../../store/useAuthStore';

const FOUNDED = 2022;
const elevations = peaksData.map(p => parseInt(p.elevation.replace(/[^0-9]/g, ''), 10) || 0);
const HIGHEST = Math.max(...elevations);
const HIGHEST_PEAK = peaksData[elevations.indexOf(HIGHEST)]?.name ?? 'Mont Blanc';

// Skyline the wordmark rises from behind (percent coordinates of the wordmark box)
const RIDGE = [[0, 78], [7, 70], [13, 74], [21, 58], [27, 64], [34, 46], [40, 55], [47, 38], [52, 30], [57, 41], [63, 35], [70, 52], [77, 47], [84, 60], [91, 54], [100, 66]];
const ridgeClip = `polygon(0% 0%, 100% 0%, ${[...RIDGE].reverse().map(([x, y]) => `${x}% ${y}%`).join(', ')})`;
const ridgePath = `M0 100 ${RIDGE.map(([x, y]) => `L${x} ${y}`).join(' ')} L100 100 Z`;
const ridgeLine = `M${RIDGE.map(([x, y]) => `${x} ${y}`).join(' L')}`;

/**
 * The last frame of the site. A stats band rolls its numbers in, then the wordmark rises out from
 * behind a mountain ridge as you reach the bottom of the page, the summit readout lands, and the
 * call to action plants a flag.
 */
export const SummitFinale = () => {
    const reduce = useReducedMotion();
    const { isLoggedIn } = useAuthStore();
    const wordRef = useRef<HTMLDivElement>(null);
    const flagRef = useRef<HTMLDivElement>(null);
    const flagIn = useInView(flagRef, { once: true, margin: '0px 0px -10% 0px' });
    const { scrollYProgress } = useScroll({ target: wordRef, offset: ['start end', 'end end'] });
    const rise = useTransform(scrollYProgress, [0.1, 0.95], reduce ? ['0%', '0%'] : ['62%', '0%']);
    const glow = useTransform(scrollYProgress, [0.6, 1], [0, 1]);
    const seasons = new Date().getFullYear() - FOUNDED;

    const stats = [
        { value: 800, suffix: '+', label: 'Summits reached' },
        { value: peaksData.length, label: 'Peaks in the atlas' },
        { value: HIGHEST, suffix: ' m', label: `Highest · ${HIGHEST_PEAK}` },
        { value: seasons, label: seasons === 1 ? 'Season on the mountain' : 'Seasons on the mountain' },
    ];

    return (
        <div className="relative w-full pt-16 md:pt-24">
            {/* Stats band */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 border-y border-white/10 py-10 md:py-12">
                {stats.map((s, i) => (
                    <div key={s.label} className={`flex flex-col items-center text-center gap-2 ${i > 0 ? 'md:border-l md:border-white/10' : ''}`}>
                        <Odometer value={s.value} suffix={s.suffix} className="font-serif text-5xl md:text-7xl text-white" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Summit readout + flag */}
            <div className="mt-16 md:mt-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
                <div className="text-center md:text-left">
                    <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-alpine-sunrise mb-3">Summit reached</p>
                    <Odometer value={HIGHEST} suffix={' m'} className="font-mono text-5xl md:text-7xl text-white tracking-tight" duration={2.4} />
                    <p className="mt-3 font-serif italic text-xl md:text-2xl text-white/65">You made it to the bottom. That's the top.</p>
                </div>

                <div ref={flagRef} className="flex items-end gap-4">
                    <div className={`summit-flag ${flagIn ? 'is-planted' : ''}`} aria-hidden="true">
                        <svg viewBox="0 0 60 90" className="w-12 h-[72px] overflow-visible">
                            <line x1="6" y1="88" x2="6" y2="4" className="summit-flag__pole" />
                            <path d="M7 6 C 22 1, 30 12, 52 6 L 52 30 C 30 36, 22 25, 7 30 Z" className="summit-flag__cloth" />
                            <ellipse cx="6" cy="88" rx="10" ry="2.5" className="summit-flag__snow" />
                        </svg>
                    </div>
                    <Link
                        to={isLoggedIn ? '/events' : '/signup'}
                        className="group/cta relative inline-flex items-center gap-4 whitespace-nowrap rounded-full bg-white text-alpine-navy pl-6 pr-1.5 py-1.5 text-sm font-semibold tracking-wide shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] hover:bg-alpine-sunrise transition-colors"
                    >
                        {isLoggedIn ? 'Pick your next climb' : 'Begin your ascent'}
                        <span className="grid place-items-center w-10 h-10 rounded-full bg-alpine-navy text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:rotate-45">
                            <ArrowUpRight size={17} />
                        </span>
                    </Link>
                </div>
            </div>

            {/* Wordmark rising from behind the ridge */}
            <div ref={wordRef} className="relative mt-16 md:mt-24 select-none" aria-label="Mountaineer Mallu">
                <div style={{ clipPath: ridgeClip }} className="relative">
                    <motion.p
                        aria-hidden="true"
                        // Sized so "MOUNTAINEER" spans the footer column on every screen
                        style={{ y: rise, fontSize: 'clamp(3rem, 11.5vw, 11rem)' }}
                        className="display-mega text-center uppercase leading-[0.8] bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-alpine-glacier/40 pb-[0.06em]"
                    >
                        Mountaineer<br />Mallu
                    </motion.p>
                </div>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <defs>
                        <linearGradient id="finale-ridge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#0B2A4D" stopOpacity="0.95" />
                            <stop offset="1" stopColor="#061A31" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={ridgePath} fill="url(#finale-ridge)" />
                    <motion.path d={ridgeLine} fill="none" stroke="#E2A071" strokeWidth={1.5} vectorEffect="non-scaling-stroke" style={{ opacity: glow }} className="drop-shadow-[0_0_6px_rgba(226,160,113,0.9)]" />
                </svg>
            </div>
        </div>
    );
};
