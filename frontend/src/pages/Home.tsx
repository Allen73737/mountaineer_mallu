import React, { useEffect, useId, useRef } from 'react';
import { motion, MotionValue, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { HeroSection } from '../components/sections/HeroSection';
import { MissionVision } from '../components/sections/MissionVision';
import { Stories } from '../components/sections/Stories';
import { Events } from '../components/sections/Events';
import { Gallery } from '../components/sections/Gallery';
import { Pillars } from '../components/sections/Pillars';
import { Reviews } from '../components/sections/Reviews';
import { Contact } from '../components/sections/Contact';
import { Merch } from '../components/sections/Merch';
import { CommunityPreview } from '../components/sections/CommunityPreview';
import { AltitudeNetwork } from '../components/sections/AltitudeNetwork';
import { ExpeditionRoute } from '../components/sections/ExpeditionRoute';
import { ComingSoon } from '../components/ui/ComingSoon';
import { DirectionalScrollReveal } from '../components/ui/DirectionalScrollReveal';
import { useSiteSettings } from '../store/useSiteSettings';
import { SafeBoundary } from '../components/ui/SafeBoundary';

const RIDGE_PATH = 'M0 70 L110 62 L190 44 L250 54 L330 26 L410 50 L470 38 L550 58 L630 32 L700 8 L770 36 L850 24 L910 50 L990 36 L1070 56 L1140 48 L1200 66';
const SUMMIT = { x: 700, y: 8 }; // highest point of RIDGE_PATH in its 1200 × 80 box

/** A glowing mountain ridge that draws itself left → right as it scrolls into view, then lights its summit. */
const SectionDivider = () => {
    const ref = useRef<HTMLDivElement>(null);
    const gradientId = useId();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.4'] });
    const pathLength = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
    const summitGlow = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);

    return (
        <div ref={ref} className="relative px-6 md:px-12 py-6 md:py-10" aria-hidden="true">
            <div className="relative max-w-[1600px] mx-auto h-10 md:h-14">
                <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#A3C9E2" stopOpacity="0" />
                            <stop offset="20%" stopColor="#A3C9E2" />
                            <stop offset="58%" stopColor="#E2A071" />
                            <stop offset="85%" stopColor="#C9A96E" />
                            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Faint full ridge so the shape reads before it is drawn */}
                    <path d={RIDGE_PATH} fill="none" strokeWidth="1" className="stroke-alpine-navy/10 dark:stroke-white/10" />
                    <motion.path
                        d={RIDGE_PATH}
                        fill="none"
                        stroke={`url(#${CSS.escape(gradientId)})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ pathLength, filter: 'drop-shadow(0 0 6px rgba(226,160,113,0.55))' }}
                    />
                </svg>
                {/* Summit light — HTML so it stays round despite the stretched SVG */}
                <motion.span
                    style={{ opacity: summitGlow, left: `${(SUMMIT.x / 1200) * 100}%`, top: `${(SUMMIT.y / 80) * 100}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(226,160,113,0.85),0_0_30px_8px_rgba(226,160,113,0.35)]"
                />
            </div>
        </div>
    );
};

// Film-slate labels per home section: scene number, name and a real Alpine coordinate
const SCENES: Record<string, { n: number; name: string; coord: string; tone: 'light' | 'dark' }> = {
    stories:   { n: 2, name: 'Chronicles',  coord: '46.58°N 8.01°E',  tone: 'dark' },
    community: { n: 3, name: 'Community',   coord: '47.42°N 10.98°E', tone: 'light' },
    events:    { n: 4, name: 'Expeditions', coord: '45.98°N 7.66°E',  tone: 'dark' },
    gallery:   { n: 5, name: 'The Reel',    coord: '46.54°N 12.14°E', tone: 'light' },
    team:      { n: 6, name: 'The Crew',    coord: '47.49°N 11.10°E', tone: 'dark' },
    reviews:   { n: 7, name: 'Debriefs',    coord: '45.83°N 6.86°E',  tone: 'dark' },
    shop:      { n: 8, name: 'Provisions',  coord: '46.02°N 7.75°E',  tone: 'dark' },
    contact:   { n: 9, name: 'Base Camp',   coord: '47.49°N 11.10°E', tone: 'light' },
};

/** "SC. 04 — EXPEDITIONS · 45.98°N 7.66°E": types itself in from behind a wipe when the section arrives. */
const SceneMarker = ({ sectionKey }: { sectionKey: string }) => {
    const scene = SCENES[sectionKey];
    if (!scene) return null;
    const tone = scene.tone === 'light' ? 'text-white/60' : 'text-alpine-navy/55 dark:text-white/50';
    return (
        <motion.div
            aria-hidden="true"
            className={`absolute top-4 md:top-6 left-4 md:left-12 z-30 pointer-events-none flex items-center gap-2.5 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] ${tone}`}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-pulse" />
            <span>SC. {String(scene.n).padStart(2, '0')}</span>
            <span className="w-5 h-px bg-current opacity-60" />
            <span>{scene.name}</span>
            <span className="hidden sm:inline opacity-70">· {scene.coord}</span>
        </motion.div>
    );
};

/** Render a section based on its visibility status. `bare` skips the reveal wrapper for sections that pin. */
const Section = ({ sectionKey, label, children, bare = false }: { sectionKey: string; label: string; children: React.ReactNode; bare?: boolean }) => {
    const { settings } = useSiteSettings();
    const config = settings.sections[sectionKey];
    const status = config?.status || 'visible';

    if (status === 'hidden') return null;
    if (status === 'coming_soon') return <ComingSoon sectionName={label} sectionId={sectionKey} />;
    // Its own error boundary: a section that crashes drops out instead of blanking the whole home page
    const content = <SafeBoundary name={`Section:${sectionKey}`}><div className="relative"><SceneMarker sectionKey={sectionKey} />{children}</div></SafeBoundary>;
    if (bare) return content;
    return <DirectionalScrollReveal id={sectionKey}>{content}</DirectionalScrollReveal>;
};

// Dusk scene in a 1440 × 900 box, bottom-anchored ("xMidYMax slice") so the summit stays centred on any screen
const FAR_RANGE = 'M0 900 L0 560 L120 520 L220 468 L300 498 L410 428 L520 482 L600 452 L700 500 L820 440 L930 472 L1040 408 L1150 470 L1260 438 L1360 490 L1440 470 L1440 900 Z';
const MID_RANGE = 'M0 900 L0 650 L100 600 L200 545 L280 575 L380 500 L470 560 L560 620 L720 660 L880 610 L980 540 L1060 575 L1160 490 L1260 560 L1360 600 L1440 580 L1440 900 Z';
const MID_SNOW = 'M352 520 L380 500 L408 520 L392 516 L380 528 L366 516 Z M1134 510 L1160 490 L1188 512 L1172 508 L1160 520 L1148 508 Z';
const PEAK = 'M0 900 L0 780 L180 720 L300 650 L400 580 L480 520 L540 470 L590 420 L620 395 L660 350 L690 330 L720 300 L745 325 L770 320 L800 360 L840 400 L880 420 L930 470 L1000 520 L1100 600 L1240 680 L1440 750 L1440 900 Z';
const PEAK_LIT = 'M720 300 L690 330 L660 350 L620 395 L590 420 L540 470 L480 520 L400 580 L470 585 L560 520 L615 468 L655 430 L690 392 L706 352 Z';
const PEAK_SNOW = 'M720 300 L745 325 L770 320 L800 360 L782 374 L764 356 L744 386 L726 362 L706 398 L690 372 L668 392 L648 380 L660 350 L690 330 Z';
const RIDGE_LEFT = 'M720 300 L690 330 L660 350 L620 395 L590 420 L540 470 L480 520 L400 580';
const CLIMB = 'M676 772 L712 722 L652 664 L726 606 L672 548 L736 492 L694 436';
const TENTS = [{ x: 632, s: 1 }, { x: 660, s: 1.25 }, { x: 694, s: 0.9 }];

// Deterministic star field (no Math.random so SSR/hydration and re-renders agree)
const STARS = Array.from({ length: 70 }, (_, i) => {
    const r = (n: number) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    return { x: r(1) * 1440, y: r(2) * 470, size: 0.6 + r(3) * 1.4, delay: r(4) * 6, twinkle: r(5) > 0.6 };
});

// Topographic contours of the camp basin, revealed once the camera is "inside" the mountain
const CONTOURS = Array.from({ length: 9 }, (_, k) => {
    const base = 70 + k * 58;
    const pts = Array.from({ length: 97 }, (_, j) => {
        const t = (j / 96) * Math.PI * 2;
        const r = base * (1 + 0.12 * Math.sin(3 * t + k * 0.4) + 0.07 * Math.sin(5 * t - k * 0.7) + 0.035 * Math.sin(9 * t + k));
        return `${(720 + Math.cos(t) * r * 1.35).toFixed(1)} ${(450 + Math.sin(t) * r).toFixed(1)}`;
    });
    const labelT = -0.65;
    const lr = base * (1 + 0.12 * Math.sin(3 * labelT + k * 0.4) + 0.07 * Math.sin(5 * labelT - k * 0.7) + 0.035 * Math.sin(9 * labelT + k));
    return { d: `M${pts.join(' L')} Z`, elevation: 5364 - k * 80, label: { x: 720 + Math.cos(labelT) * lr * 1.35, y: 450 + Math.sin(labelT) * lr } };
});
const EMBERS = Array.from({ length: 14 }, (_, i) => ({ left: 47 + ((i * 37) % 60) / 10, delay: (i * 0.73) % 5, dur: 3.5 + ((i * 53) % 30) / 10 }));

const Contour = ({ d, index, progress }: { d: string; index: number; progress: MotionValue<number> }) => {
    const pathLength = useTransform(progress, [0.6 + index * 0.02, 0.86 + index * 0.012], [0, 1]);
    return <motion.path d={d} fill="none" strokeWidth={index % 3 === 0 ? 1.4 : 0.8} className="stroke-alpine-glacier/30 dark:stroke-alpine-sunrise/25" style={{ pathLength }} />;
};

/**
 * Fly into the peak: approaching Base Camp, a dusk scene plays out (sun sinking behind the range,
 * stars coming out, mist drifting, a snow plume off the summit, headlamps climbing above a lit camp),
 * then the camera pushes into the mountain until its dark face fills the screen and becomes the
 * Contact section's background. Pinned for ~1 screen.
 */
const SummitPushIn = () => {
    const ref = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SVGSVGElement>(null);
    const reduce = useReducedMotion();
    const ids = useId().replace(/:/g, '');
    const live = useInView(ref, { margin: '20% 0px' });
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

    // SMIL headlamps keep running off-screen unless paused explicitly
    useEffect(() => {
        const svg = sceneRef.current;
        if (!svg) return;
        if (live) svg.unpauseAnimations(); else svg.pauseAnimations();
    }, [live]);

    const peakScale = useTransform(p, [0, 0.85], [1, 16], { ease: t => t * t * t });
    const midScale = useTransform(p, [0, 0.8], [1, 2.2]);
    const midOpacity = useTransform(p, [0.45, 0.78], [1, 0]);
    const farScale = useTransform(p, [0, 0.8], [1, 1.35]);
    const farY = useTransform(p, [0, 0.8], ['0%', '-4%']);
    const sunY = useTransform(p, [0, 0.7], ['0vh', '16vh']);
    const sunScale = useTransform(p, [0, 0.7], [1, 1.15]);
    const night = useTransform(p, [0.05, 0.65], [0, 0.75]);
    const stars = useTransform(p, [0.1, 0.55], [0.25, 1]);
    const topFade = useTransform(p, [0, 0.18], [1, 0]);
    const lifeOpacity = useTransform(p, [0.4, 0.58], [1, 0]);
    const captionOpacity = useTransform(p, [0.05, 0.25, 0.5, 0.62], [0, 1, 1, 0]);
    const captionY = useTransform(p, [0.05, 0.62], [30, -40]);
    const captionBlur = useTransform(p, [0.5, 0.62], ['blur(0px)', 'blur(8px)']);
    const arrival = useTransform(p, [0.6, 0.72], [0, 1]);
    const arrivalY = useTransform(p, [0.6, 1], [40, -20]);
    const altitude = useTransform(p, [0.62, 0.92], [0, 5364], { clamp: true });
    const altitudeLabel = useTransform(altitude, v => `${Math.round(v).toLocaleString('en-US')} m`);

    if (reduce) return null;

    const g = (name: string) => `url(#${ids}-${name})`;

    return (
        <div ref={ref} className="relative h-[200vh]" aria-hidden="true">
            <div className={`summit-scene sticky top-0 h-[100svh] overflow-hidden ${live ? '' : 'is-paused'}`}>
                {/* Sky: golden hour, deepening to night as the camera closes in */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#16365E] via-[#5B6F93] to-[#F2B98C] dark:from-[#03060C] dark:via-[#1A2340] dark:to-[#8A5A55]" />
                <motion.div style={{ opacity: night }} className="absolute inset-0 bg-gradient-to-b from-[#050B16] via-[#0B1E38] to-[#3A3550]" />

                <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full">
                    <motion.g style={{ opacity: stars }}>
                        {STARS.map((s, i) => (
                            <circle key={i} cx={s.x} cy={s.y} r={s.size} fill="#FFF6E6" className={s.twinkle ? 'summit-twinkle' : undefined} style={{ animationDelay: `${s.delay}s` }} opacity={s.twinkle ? undefined : 0.7} />
                        ))}
                    </motion.g>
                </svg>
                <span className="summit-shooting-star" />

                {/* Sun sinking behind the far range */}
                <motion.div style={{ y: sunY, scale: sunScale }} className="absolute left-[30%] md:left-[34%] top-[44%] -translate-x-1/2 -translate-y-1/2 w-[46vmin] h-[46vmin] rounded-full bg-[radial-gradient(circle,rgba(255,236,200,1)_0%,rgba(255,196,140,0.9)_9%,rgba(242,160,113,0.35)_24%,rgba(226,160,113,0)_62%)] dark:bg-[radial-gradient(circle,rgba(255,240,220,0.95)_0%,rgba(220,200,190,0.55)_8%,rgba(160,150,190,0.18)_26%,rgba(120,120,170,0)_60%)]" />

                {/* Flock crossing the sky */}
                <div className="summit-flock absolute top-[18%] left-0">
                    {[[0, 0], [22, 10], [40, -6], [58, 14], [14, 24]].map(([x, y], i) => (
                        <svg key={i} viewBox="0 0 16 6" className="summit-bird absolute w-4 h-2 md:w-5 md:h-2.5" style={{ left: x, top: y, animationDelay: `${i * 0.17}s` }}>
                            <path d="M0 4 Q4 0 8 4 Q12 0 16 4" fill="none" stroke="#1B2A3F" strokeWidth="1.4" strokeLinecap="round" className="dark:stroke-[#C9D3E3]" />
                        </svg>
                    ))}
                </div>

                <motion.svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" style={{ scale: farScale, y: farY, transformOrigin: '50% 70%' }} className="absolute inset-0 w-full h-full">
                    <defs>
                        <linearGradient id={`${ids}-far`} x1="0" y1="400" x2="0" y2="720" gradientUnits="userSpaceOnUse">
                            <stop offset="0" className="[stop-color:#8C93B8] dark:[stop-color:#3A3F5C]" />
                            <stop offset="1" className="[stop-color:#D9A99A] dark:[stop-color:#4A3E50]" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    <path d={FAR_RANGE} fill={g('far')} />
                </motion.svg>

                <div className="summit-mist absolute -inset-x-1/4 top-[52%] h-[18vh]" />

                <motion.svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" style={{ scale: midScale, opacity: midOpacity, transformOrigin: '50% 75%' }} className="absolute inset-0 w-full h-full">
                    <defs>
                        <linearGradient id={`${ids}-mid`} x1="0" y1="480" x2="0" y2="820" gradientUnits="userSpaceOnUse">
                            <stop offset="0" className="[stop-color:#4C5F86] dark:[stop-color:#1C2236]" />
                            <stop offset="1" className="[stop-color:#26385A] dark:[stop-color:#0E121C]" />
                        </linearGradient>
                    </defs>
                    <path d={MID_RANGE} fill={g('mid')} />
                    <path d={MID_SNOW} fill="#F4E6E0" opacity="0.75" />
                </motion.svg>


                {/* The peak. Its body settles to the Contact navy by y≈600, which is what fills the screen at full push-in */}
                <motion.svg
                    ref={sceneRef}
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMax slice"
                    style={{ scale: peakScale, transformOrigin: '50% 75%' }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                >
                    <defs>
                        <linearGradient id={`${ids}-body`} x1="0" y1="300" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                            <stop offset="0" className="[stop-color:#2D4F78] dark:[stop-color:#1B2233]" />
                            <stop offset="1" className="[stop-color:#0A2747] dark:[stop-color:#07090E]" />
                        </linearGradient>
                        <linearGradient id={`${ids}-lit`} x1="720" y1="300" x2="470" y2="590" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#FFC2B0" stopOpacity="0.8" />
                            <stop offset="0.4" stopColor="#E8939A" stopOpacity="0.4" />
                            <stop offset="1" stopColor="#B87C9E" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id={`${ids}-snow`} x1="660" y1="300" x2="800" y2="400" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#FFE9DA" />
                            <stop offset="0.55" stopColor="#E9D4D6" />
                            <stop offset="1" stopColor="#8E9BB8" />
                        </linearGradient>
                        <radialGradient id={`${ids}-plume`}>
                            <stop offset="0" stopColor="#FFF4EA" stopOpacity="0.55" />
                            <stop offset="1" stopColor="#FFF4EA" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id={`${ids}-glow`}>
                            <stop offset="0" stopColor="#FFC27A" stopOpacity="0.75" />
                            <stop offset="1" stopColor="#FFC27A" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    <path d={PEAK} fill={g('body')} />
                    <path d={PEAK_LIT} fill={g('lit')} className="summit-alpenglow" />
                    <path d={PEAK_SNOW} fill={g('snow')} />
                    <path d={RIDGE_LEFT} fill="none" stroke="#FFD2B0" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />

                    {/* Wind blowing snow off the summit */}
                    <ellipse cx="800" cy="300" rx="95" ry="13" fill={g('plume')} className="summit-plume" />
                    <ellipse cx="830" cy="292" rx="70" ry="9" fill={g('plume')} className="summit-plume" style={{ animationDelay: '-3s' }} />

                    {/* Base camp: tents glowing at the foot, headlamps working up the switchbacks */}
                    <motion.g style={{ opacity: lifeOpacity }}>
                        <path d={CLIMB} fill="none" stroke="#FFD9A8" strokeWidth="1" strokeDasharray="2 7" strokeLinecap="round" opacity="0.35" />
                        {[0, 5, 10].map(delay => (
                            <g key={delay}>
                                <circle r="7" fill={g('glow')} />
                                <circle r="1.8" fill="#FFF1D2" />
                                <animateMotion dur="15s" begin={`-${delay}s`} repeatCount="indefinite" path={CLIMB} />
                            </g>
                        ))}
                        <ellipse cx="664" cy="782" rx="70" ry="26" fill={g('glow')} className="summit-campfire" />
                        {TENTS.map(({ x, s }) => (
                            <path key={x} d={`M${x - 11 * s} 784 L${x} ${784 - 17 * s} L${x + 11 * s} 784 Z`} fill="#F2A65E" stroke="#FFD9A8" strokeWidth="0.6" className="summit-tent" style={{ animationDelay: `${x % 7 * 0.3}s` }} />
                        ))}
                    </motion.g>
                </motion.svg>

                <motion.div
                    style={{ opacity: captionOpacity, y: captionY, filter: captionBlur }}
                    className="absolute inset-x-0 top-[16vh] md:top-[18vh] text-center px-6"
                >
                    <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-alpine-sunrise mb-4">Final approach</p>
                    <p className="font-serif text-3xl md:text-6xl text-alpine-snow drop-shadow-[0_2px_24px_rgba(8,40,76,0.55)]">Every summit starts at base camp.</p>
                </motion.div>
                {/* Arrival: inside the mountain the navy becomes a contour map of the camp basin, so the hand-off to Contact never reads as empty */}
                <motion.div style={{ opacity: arrival }} className="absolute inset-0 pointer-events-none">
                    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                        {CONTOURS.map((c, i) => <Contour key={i} d={c.d} index={i} progress={p} />)}
                        {CONTOURS.filter((_, i) => i % 2 === 1).map(c => (
                            <text key={c.elevation} x={c.label.x} y={c.label.y} className="fill-alpine-glacier/45 dark:fill-alpine-sunrise/40 font-mono" fontSize="11" letterSpacing="2">{c.elevation}</text>
                        ))}
                        <path d="M720 900 C 700 800, 780 720, 735 640 S 690 520, 720 470" fill="none" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round" className="stroke-alpine-sunrise/70" />
                    </svg>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(4,16,31,0.65)_100%)] dark:bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(0,0,0,0.7)_100%)]" />

                    {/* Camp marker with embers rising off the fire */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                        {EMBERS.map((e, i) => (
                            <span key={i} className="summit-ember" style={{ left: `${e.left}%`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }} />
                        ))}
                        <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,194,122,0.55),transparent_65%)] summit-campfire-glow" />
                        <svg viewBox="0 0 40 30" className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-10 h-8">
                            <path d="M4 28 L20 4 L36 28 Z" fill="none" stroke="#FFD9A8" strokeWidth="1.6" strokeLinejoin="round" />
                            <path d="M20 4 L20 28 M14 28 L20 18 L26 28" fill="none" stroke="#FFD9A8" strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <motion.div style={{ y: arrivalY }} className="absolute inset-x-0 top-[calc(50%+5.5rem)] text-center px-6">
                        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-alpine-sunrise mb-3">Arrival · 27.98°N 86.92°E</p>
                        <motion.p className="font-mono text-4xl md:text-6xl tabular-nums text-alpine-snow tracking-tight">{altitudeLabel}</motion.p>
                        <p className="mt-3 font-serif italic text-lg md:text-2xl text-white/70">Drop your pack. The next climb is planned here.</p>
                    </motion.div>

                    {/* Corner telemetry, film-slate style */}
                    <div className="absolute inset-x-4 md:inset-x-12 top-6 md:top-10 flex justify-between font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/40">
                        <span>Camp · I</span><span className="hidden sm:inline">Wind 12 km/h · −8°C</span><span>Night 01</span>
                    </div>
                </motion.div>

                {/* Blend in from the page above */}
                <motion.div style={{ opacity: topFade }} className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-alpine-snow dark:from-black to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export const Home = () => {
    return (
        <main className="relative w-full overflow-clip">
            <div id="hero">
                <SafeBoundary name="HeroSection"><HeroSection /></SafeBoundary>
            </div>

            {/* Pinned chapter — manages its own scroll choreography, so no reveal wrapper */}
            <SafeBoundary name="MissionVision"><MissionVision /></SafeBoundary>

            <SectionDivider />

            <Section sectionKey="stories" label="Stories">
                <Stories />
            </Section>

            <Section sectionKey="community" label="Community">
                <CommunityPreview />
            </Section>

            <SectionDivider />

            <Section sectionKey="events" label="Events">
                <Events />
            </Section>

            {/* The route drawn up a 3D massif, camp by camp (pins; lazy-loads three.js) */}
            <SafeBoundary name="ExpeditionRoute"><ExpeditionRoute /></SafeBoundary>

            <SafeBoundary name="AltitudeNetwork"><AltitudeNetwork /></SafeBoundary>

            <Section sectionKey="gallery" label="Gallery" bare>
                <Gallery />
            </Section>

            <SectionDivider />
            
            <Section sectionKey="team" label="Team">
                <Pillars />
            </Section>

            <Section sectionKey="reviews" label="Reviews">
                <Reviews />
            </Section>

            <SectionDivider />

            <Section sectionKey="shop" label="Merchandise">
                <Merch />
            </Section>

            <SafeBoundary name="SummitPushIn"><SummitPushIn /></SafeBoundary>

            <Section sectionKey="contact" label="Contact" bare>
                <Contact />
            </Section>
        </main>
    );
};
