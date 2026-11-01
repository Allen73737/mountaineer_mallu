import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LineReveal } from '../ui/LineReveal';
import { useQuality } from '../../lib/quality';
import type { RouteCamp } from '../ui/RouteTerrain';
import { useStore } from '../../store/useStore';
import { SafeBoundary } from '../ui/SafeBoundary';

const loadTerrain = () => import('../ui/RouteTerrain');
const RouteTerrain = lazy(loadTerrain);

// Mont Blanc by the Goûter route: the huts and refuges climbers actually stop at
const CAMPS: RouteCamp[] = [
    { name: "Nid d'Aigle", elevation: 2372, at: 0 },
    { name: 'Tête Rousse', elevation: 3167, at: 0.3 },
    { name: 'Goûter Hut', elevation: 3835, at: 0.58 },
    { name: 'Vallot', elevation: 4362, at: 0.8 },
    { name: 'Summit', elevation: 4809, at: 1 },
];

/** Altitude along the route, interpolated between camps. */
const altitudeAt = (p: number) => {
    for (let i = 1; i < CAMPS.length; i++) {
        const a = CAMPS[i - 1], b = CAMPS[i];
        if (p <= b.at) return a.elevation + ((p - a.at) / (b.at - a.at)) * (b.elevation - a.elevation);
    }
    return CAMPS[CAMPS.length - 1].elevation;
};

// Low tier / no WebGL: the same climb as a drawn line over a contour sketch
const FALLBACK_ROUTE = 'M120 560 C 220 540, 260 470, 340 470 S 470 420, 470 360 S 580 300, 600 250 S 690 170, 720 120';

/**
 * "The route" chapter: pinned for ~3 screens while the expedition line draws itself up a 3D massif,
 * camps light up as the climber reaches them and an altimeter climbs alongside. The WebGL scene is
 * lazy-loaded (three.js stays out of the main bundle), only renders while on screen, and is replaced
 * by a 2D drawing on the low quality tier.
 */
export const ExpeditionRoute = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const tier = useQuality(s => s.tier);
    const ref = useRef<HTMLElement>(null);
    const near = useInView(ref, { margin: '60% 0px' });
    const [warmed, setWarmed] = useState(false);
    const onScreen = useInView(ref, { margin: '0px' });
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const progress = useTransform(scrollYProgress, [0.05, 0.92], [0, 1], { clamp: true });
    const altitude = useTransform(progress, p => Math.round(altitudeAt(p)).toLocaleString('en-US'));
    const [reached, setReached] = useState(0);
    useMotionValueEvent(progress, 'change', p => {
        const idx = CAMPS.reduce((acc, c, i) => (p >= c.at - 0.005 ? i : acc), 0);
        setReached(prev => (prev === idx ? prev : idx));
    });
    const use3D = !reduce && tier !== 'low';
    const theme = useStore(s => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Fetch the three.js chunk while the browser is idle so the scene is ready before the visitor arrives
    useEffect(() => {
        if (!use3D) return;
        // Then mount it (off screen, not rendering) so the terrain is built and its shaders compiled during
        // idle time instead of as a hitch while the visitor scrolls toward the section
        const warm = () => { loadTerrain().then(() => setWarmed(true)).catch(() => {}); };
        // Safari has no requestIdleCallback
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(warm, { timeout: 6000 });
            return () => window.cancelIdleCallback(id);
        }
        const t = setTimeout(warm, 4000);
        return () => clearTimeout(t);
    }, [use3D]);

    // The same climb as a drawn line over a contour sketch: low tier, reduced motion, or if the 3D scene fails
    const flatMap = (
        <svg viewBox="0 0 840 640" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full opacity-90" aria-hidden="true">
            {Array.from({ length: 7 }, (_, k) => (
                <ellipse key={k} cx="720" cy="140" rx={60 + k * 85} ry={40 + k * 60} fill="none" stroke="rgba(163,201,226,0.14)" />
            ))}
            <path d={FALLBACK_ROUTE} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="3 7" />
            <motion.path d={FALLBACK_ROUTE} fill="none" stroke="#E2A071" strokeWidth="3" strokeLinecap="round" style={{ pathLength: reduce ? 1 : progress }} />
        </svg>
    );

    return (
        <section ref={ref} id="route" className={`relative ${reduce ? '' : 'h-[320vh]'}`}>
            <div className={`${reduce ? '' : 'sticky top-0 h-[100svh]'} overflow-hidden bg-gradient-to-b from-[#0B1E36] via-[#0a1628] to-[#060D18] dark:from-[#07080B] dark:via-[#040506] dark:to-black text-white`}>
                {/* Scene */}
                <div className="absolute inset-0">
                    {use3D ? (
                        (near || warmed) && (
                            // No WebGL (old GPU, disabled acceleration) or a scene error: show the 2D map instead
                            <SafeBoundary name="RouteTerrain" fallback={flatMap}>
                                <Suspense fallback={null}>
                                    <RouteTerrain progress={progress} camps={CAMPS} active={onScreen} quality={tier === 'high' ? 'high' : 'medium'} dark={isDark} />
                                </Suspense>
                            </SafeBoundary>
                        )
                    ) : flatMap}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(4,10,20,0.75)_100%)] dark:bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(0,0,0,0.8)_100%)]" />
                </div>

                {/* Copy */}
                <div className="relative z-10 h-full max-w-[1600px] mx-auto px-5 md:px-12 pt-24 md:pt-28 pb-10 flex flex-col justify-between pointer-events-none">
                    <div className="max-w-xl">
                        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-alpine-sunrise mb-4">{t('route.kicker', 'The route · Mont Blanc')}</p>
                        <h2 className="cine-title has-lines font-serif text-white"><LineReveal>{t('route.title', 'The Goûter line, camp by camp')}</LineReveal></h2>
                    </div>

                    <div className="flex items-end justify-between gap-6">
                        <ol className="flex flex-col gap-2.5 md:gap-3">
                            {CAMPS.map((c, i) => (
                                <li key={c.name} className={`flex items-center gap-3 transition-all duration-700 ${i <= reached ? 'opacity-100 translate-x-0' : 'opacity-35 -translate-x-1'}`}>
                                    <span className={`w-2 h-2 rounded-full transition-colors duration-700 ${i <= reached ? 'bg-alpine-sunrise shadow-[0_0_10px_rgba(226,160,113,0.9)]' : 'bg-white/30'}`} />
                                    <span className="font-serif text-lg md:text-2xl">{c.name}</span>
                                    <span className="font-mono text-[10px] md:text-xs text-white/55 tabular-nums">{c.elevation.toLocaleString('en-US')} m</span>
                                </li>
                            ))}
                        </ol>
                        <div className="text-right">
                            <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/50 mb-1">{t('route.altitude', 'Altitude')}</p>
                            <p className="font-mono text-3xl md:text-6xl tabular-nums tracking-tight"><motion.span>{altitude}</motion.span><span className="text-sm md:text-lg text-white/50 ml-1">m</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
