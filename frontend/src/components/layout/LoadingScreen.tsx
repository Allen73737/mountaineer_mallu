import { useEffect, useId, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { peaksData } from '../../data/peaks';
import { useLenis } from '../ui/SmoothScrollProvider';
import { useIntro } from '../../lib/intro';
import { LOGO_CENTRELINES, LOGO_GRADIENT, LOGO_STROKES, LOGO_TEXT, LOGO_VIEWBOX } from '../../data/logoVector';

/* ═══════════════════════════════════════════════════════════════
   "ASCENT" — EDITORIAL INTRO
   The logo draws itself: the vector mark (traced from the artwork so it
   stays sharp at any size) is revealed along the centreline of each
   brushstroke (ridge, swoosh, curl, base) through SVG masks, the
   lettering inside it wipes in, then a band of light runs along the
   strokes. The lock-up slowly dollies in. Beneath it
   the wordmark (in the logo's own Montserrat) condenses in from wide,
   out-of-focus letters toward the centre, inside a hairline frame,
   with a rolling 000 → 100 counter. On exit the content blurs and
   drifts away while the logo flies to the navbar, then the panel lifts
   off the top with a curved trailing edge that flattens as it leaves.
   Only transform / opacity / filter / stroke-dashoffset animate.
   ═══════════════════════════════════════════════════════════════ */

// Artwork space of the source PNG; the invisible handoff copy is placed in it
const IMG = { w: 512, h: 488 };
const VIEW = LOGO_VIEWBOX;

const COUNT_MS = 2800;
const HOLD_MS = 3500;
const REDUCED_HOLD_MS = 650;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
// Trailing edge of the lifting panel: hangs in a curve, flattens as it leaves (same command structure so `d` can tween)
const EDGE_CURVED = 'M0 0 L100 0 L100 0 Q50 100 0 0 Z';
const EDGE_FLAT = 'M0 0 L100 0 L100 0 Q50 0 0 0 Z';
const LIFT = { delay: 0.3, duration: 1.15 };

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// Deterministic star field so re-renders stay stable
const STARS = Array.from({ length: 40 }, (_, i) => {
    const r = (n: number) => {
        const x = Math.sin(i * 9301 + n * 49297) * 233280;
        return x - Math.floor(x);
    };
    return { left: r(1) * 100, top: r(2) * 70, size: 1 + r(3) * 1.4, delay: r(4) * 3, duration: 2.4 + r(5) * 2.6 };
});
const DIGITS = Array.from({ length: 10 }, (_, i) => i);
const WORDMARK = 'MOUNTAINEER MALLU';
const WORDMARK_CENTER = (WORDMARK.length - 1) / 2;

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    const theme = useStore(s => s.theme);
    const { lenis } = useLenis();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const prefersReducedMotion = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
    );

    const peak = useMemo(() => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        return peaksData[dateSeed % peaksData.length];
    }, []);

    const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const progressRef = useRef<HTMLDivElement>(null);
    const logoStageRef = useRef<HTMLDivElement>(null);
    const maskId = useId().replace(/:/g, '');

    const onCompleteRef = useRef(onComplete);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    // Freeze page scroll underneath the loader
    useEffect(() => {
        lenis?.stop();
        const html = document.documentElement;
        const prevOverflow = html.style.overflow;
        html.style.overflow = 'hidden';
        return () => {
            html.style.overflow = prevOverflow;
            lenis?.start();
        };
    }, [lenis]);

    // Roll each digit column of the counter to its value; leading zeros stay dimmed
    const setCounter = (value: number) => {
        const padded = String(value).padStart(3, '0');
        const firstSignificant = padded.search(/[1-9]/);
        padded.split('').forEach((d, i) => {
            const col = digitRefs.current[i];
            if (!col) return;
            const strip = col.firstElementChild as HTMLElement | null;
            if (strip && strip.dataset.d !== d) {
                strip.dataset.d = d;
                strip.style.transform = `translateY(-${Number(d) * 10}%)`;
            }
            col.classList.toggle('is-lead', firstSignificant === -1 ? i < 2 : i < firstSignificant);
        });
    };

    // Single rAF: counter + progress line (the logo draws itself in CSS)
    useEffect(() => {
        if (prefersReducedMotion) {
            setCounter(100);
            const t = setTimeout(() => { useIntro.getState().finishIntro(); onCompleteRef.current(); }, REDUCED_HOLD_MS);
            return () => clearTimeout(t);
        }

        let raf = 0;
        let start = 0;
        const tick = (now: number) => {
            if (!start) start = now;

            const c = Math.min((now - start) / COUNT_MS, 1);
            const count = easeOutQuart(c);
            setCounter(Math.round(count * 100));
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${count})`;

            if (c < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        const exitTimer = setTimeout(() => {
            // Hand the logo to <LogoHandoff />: record where it sits and let a copy fly to the navbar
            const img = logoStageRef.current?.querySelector('img');
            const r = img?.getBoundingClientRect();
            if (img && r && r.width > 0) {
                useIntro.getState().finishIntro({ rect: { x: r.x, y: r.y, width: r.width, height: r.height }, src: img.getAttribute('src') || '' });
                // The flying copy is the same (already cached) PNG, so it paints on the next frame; hide ours then so the
                // mark never appears twice or leaves a blurred ghost behind while the content exits.
                // visibility, not opacity: the mark's entrance animation holds opacity and would override it
                const stage = logoStageRef.current;
                requestAnimationFrame(() => { if (stage) stage.style.visibility = 'hidden'; });
            } else {
                useIntro.getState().finishIntro();
            }
            onCompleteRef.current();
        }, HOLD_MS);
        return () => { cancelAnimationFrame(raf); clearTimeout(exitTimer); };
    }, [prefersReducedMotion]);

    const logoSrc = isDark ? '/logos/logo-dark.png' : '/logos/logo-light.png';
    const muted = isDark ? 'text-white/45' : 'text-alpine-navy/50';

    return (
        <motion.div
            key="ascent-loader"
            className={`mm-loader fixed inset-0 z-[9999] select-none pointer-events-auto ${isDark ? 'mm-loader--dark' : 'mm-loader--light'} ${prefersReducedMotion ? 'mm-loader--still' : ''}`}
            // Outer shell only keeps the tree mounted while the lift runs its own exit
            exit={{ opacity: prefersReducedMotion ? 0 : 1, transition: { duration: prefersReducedMotion ? 0.35 : LIFT.delay + LIFT.duration + 0.05 } }}
            role="status"
            aria-live="polite"
            aria-label="Loading Mountaineer Mallu"
        >
            {/* Lift: the panel and its curved trailing edge leave together */}
            <motion.div
                className="absolute inset-0"
                exit={prefersReducedMotion ? undefined : { y: '-100%' }}
                transition={{ ...LIFT, ease: CURTAIN_EASE }}
            >
            {!prefersReducedMotion && (
                <svg className="absolute left-0 top-full w-full h-[18vh] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <motion.path
                        d={EDGE_CURVED}
                        // Seed framer with the starting shape: without it the exit tween starts from `undefined`
                        initial={{ d: EDGE_CURVED }}
                        exit={{ d: EDGE_FLAT }}
                        transition={{ ...LIFT, ease: [0.5, 0, 0.2, 1] }}
                        fill={isDark ? '#04060A' : '#EBE4DA'}
                    />
                </svg>
            )}
            <div className="mm-loader__panel absolute inset-0 overflow-hidden">
                <div className="mm-loader__glow" aria-hidden="true" />
                {isDark && (
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        {STARS.map((s, i) => (
                            <span
                                key={i}
                                className="mm-loader__star"
                                style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
                            />
                        ))}
                    </div>
                )}

                {/* Content blurs and drifts away just before the panel lifts */}
                <motion.div
                    className="absolute inset-0"
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -60, scale: 0.97, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.55, 0, 0.75, 0.2] }}
                >
                    {/* Hairline frame + captions */}
                    <div className="mm-loader__rule left-5 right-5 sm:left-10 sm:right-10 top-[9vh]" aria-hidden="true" />
                    <div className="mm-loader__rule left-5 right-5 sm:left-10 sm:right-10 bottom-[19vh] sm:bottom-[21vh]" style={{ animationDelay: '0.25s' }} aria-hidden="true" />
                    <div className={`mm-loader__caption absolute left-5 right-5 sm:left-10 sm:right-10 top-[9vh] -translate-y-full pb-3 flex justify-between text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] ${muted}`}>
                        <span>Mountaineer Mallu</span>
                        <span className="hidden sm:inline">Malayalee alpine community · Europe</span>
                        <span className="sm:hidden">Europe</span>
                    </div>

                    {/* Centrepiece: brushstroke logo + wordmark */}
                    <div className="absolute inset-x-0 top-[9vh] bottom-[19vh] sm:bottom-[21vh] flex flex-col items-center justify-center px-6">
                        <div className="mm-loader__dolly relative flex flex-col items-center">
                        {/* The mark, drawing itself */}
                        <div ref={logoStageRef} className="mm-loader__mark mm-loader__logo relative w-[min(74vw,440px)]" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
                            <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
                                <defs>
                                    <linearGradient id={`${maskId}-copper`} x1="0" y1="140" x2="0" y2="314" gradientUnits="userSpaceOnUse">
                                        {LOGO_GRADIENT[isDark ? 'dark' : 'light'].map((c, i) => <stop key={i} offset={LOGO_GRADIENT.offsets[i]} stopColor={c} />)}
                                    </linearGradient>
                                    <linearGradient id={`${maskId}-light`} x1="0" y1="140" x2="0" y2="314" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#FFE7D2" />
                                        <stop offset="1" stopColor="#FFF6EE" />
                                    </linearGradient>
                                    {/* Ink: each stroke is uncovered along its centreline */}
                                    <mask id={`${maskId}-ink`} maskUnits="userSpaceOnUse" x="0" y="0" width={IMG.w} height={IMG.h}>
                                        {LOGO_CENTRELINES.map(st => (
                                            <path key={st.id} d={st.d} pathLength={1} className={`mm-ink mm-ink--${st.id}`} fill="none" stroke="#fff" strokeWidth={st.width} strokeLinecap="round" strokeLinejoin="round" />
                                        ))}
                                        <rect className="mm-ink-text" x="76" y="260" width="216" height="32" fill="#fff" />
                                    </mask>
                                    {/* Glint: a short band of light that runs along the same strokes */}
                                    <mask id={`${maskId}-glint`} maskUnits="userSpaceOnUse" x="0" y="0" width={IMG.w} height={IMG.h}>
                                        {LOGO_CENTRELINES.map(st => (
                                            <path key={st.id} d={st.d} pathLength={1} className={`mm-glint mm-glint--${st.id}`} fill="none" stroke="#fff" strokeWidth={st.width} strokeLinecap="round" />
                                        ))}
                                    </mask>
                                </defs>
                                <g mask={`url(#${maskId}-ink)`}>
                                    {LOGO_STROKES.map(st => <path key={st.id} d={st.shape} fill={`url(#${maskId}-copper)`} />)}
                                    <text
                                        x={LOGO_TEXT.x}
                                        y={LOGO_TEXT.y}
                                        fontSize={LOGO_TEXT.size}
                                        textLength={LOGO_TEXT.length}
                                        lengthAdjust="spacing"
                                        className="mm-loader__logo-text"
                                        fill={isDark ? '#FAF8F8' : '#1E1F1A'}
                                    >
                                        {LOGO_TEXT.label}
                                    </text>
                                </g>
                                {!prefersReducedMotion && (
                                    <g mask={`url(#${maskId}-glint)`} className="mm-loader__glint-layer">
                                        {LOGO_STROKES.map(st => <path key={st.id} d={st.shape} fill={`url(#${maskId}-light)`} />)}
                                    </g>
                                )}
                            </svg>
                            {/* Invisible full-size copy: gives <LogoHandoff /> the PNG's exact on-screen box to fly from */}
                            <img
                                src={logoSrc}
                                alt=""
                                aria-hidden="true"
                                className="absolute max-w-none opacity-0 pointer-events-none"
                                style={{
                                    left: `${(-VIEW.x / VIEW.w) * 100}%`,
                                    top: `${(-VIEW.y / VIEW.h) * 100}%`,
                                    width: `${(IMG.w / VIEW.w) * 100}%`,
                                    height: `${(IMG.h / VIEW.h) * 100}%`,
                                }}
                                draggable={false}
                            />
                        </div>

                        <h1 className="mm-loader__word relative mt-3 sm:mt-5 text-center whitespace-nowrap text-[clamp(1.35rem,5.6vw,4.6rem)] leading-none" aria-label="Mountaineer Mallu">
                            {WORDMARK.split('').map((ch, i) => {
                                const offset = i - WORDMARK_CENTER;
                                return (
                                    <span
                                        key={i}
                                        aria-hidden="true"
                                        className="mm-loader__char"
                                        style={{ ['--o' as string]: offset, animationDelay: `${1500 + Math.abs(offset) * 40}ms` }}
                                    >
                                        {ch === ' ' ? ' ' : ch}
                                    </span>
                                );
                            })}
                            {/* Light sweep, clipped to the glyphs */}
                            <span className="mm-loader__sweep" aria-hidden="true">{WORDMARK}</span>
                        </h1>
                        <p className={`mm-loader__tagline mt-4 sm:mt-6 text-[9px] sm:text-xs font-semibold uppercase ${muted}`}>
                            Ascend · Explore · Belong
                        </p>
                        </div>
                    </div>

                    {/* Footer: today's peak + rolling counter */}
                    <div className="absolute left-5 right-5 sm:left-10 sm:right-10 bottom-[5vh] h-[14vh] sm:h-[16vh] flex items-end justify-between gap-6">
                        <div className={`mm-loader__caption pb-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] ${muted}`} style={{ animationDelay: '0.8s' }}>
                            <p className={isDark ? 'text-alpine-sunrise' : 'text-[#9A5E43]'}>Today's summit</p>
                            <p className="mt-1.5">{peak.name} · {peak.elevation}</p>
                        </div>
                        <p className="mm-loader__counter font-serif font-light leading-none [font-variant-numeric:lining-nums_tabular-nums] text-[clamp(3.5rem,13vw,9.5rem)] flex items-start" aria-hidden="true">
                            {[0, 1, 2].map(i => (
                                <span key={i} ref={el => { digitRefs.current[i] = el; }} className={`mm-loader__digit ${i < 2 ? 'is-lead' : ''}`}>
                                    <span data-d="0">
                                        {DIGITS.map(d => <span key={d}>{d}</span>)}
                                    </span>
                                </span>
                            ))}
                            <span className="ml-1 text-[0.3em] mt-[0.18em] text-alpine-sunrise">%</span>
                        </p>
                    </div>

                    {/* Hairline progress */}
                    <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden">
                        <div
                            ref={progressRef}
                            className="h-full w-full origin-left bg-gradient-to-r from-alpine-glacier via-alpine-sunrise to-alpine-gold"
                            style={{ transform: prefersReducedMotion ? 'scaleX(1)' : 'scaleX(0)' }}
                        />
                    </div>
                </motion.div>
            </div>
            </motion.div>
        </motion.div>
    );
};
