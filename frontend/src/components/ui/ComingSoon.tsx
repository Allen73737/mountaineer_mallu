import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type TargetAndTransition, type Transition } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { sceneImages, getHeroImageUrl } from '../../data/peaks';
import { splitGraphemes } from '../../lib/intro';

interface ComingSoonProps {
    sectionName: string;
    sectionId?: string;
}

const MILESTONES: { label: string; done: boolean }[] = [
    { label: 'Concept & design', done: true },
    { label: 'Content gathered', done: true },
    { label: 'Build in progress', done: false },
    { label: 'Public launch', done: false },
];
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Placeholder for sections and pages switched to "coming soon". Editorial layout: the section name
 * set huge (sized from its longest word so it always fills one line), "Coming soon" in a moving
 * gradient beneath it, then a pointer-tilted photo card beside the milestones.
 * Day and night photos follow the theme and are used nowhere else on the site.
 */
export const ComingSoon: React.FC<ComingSoonProps> = ({ sectionName, sectionId }) => {
    const reduce = useReducedMotion();
    const cardRef = useRef<HTMLDivElement>(null);
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const sx = useSpring(px, { stiffness: 110, damping: 18 });
    const sy = useSpring(py, { stiffness: 110, damping: 18 });
    const rotateY = useTransform(sx, [0, 1], [-7, 7]);
    const rotateX = useTransform(sy, [0, 1], [6, -6]);
    const imageX = useTransform(sx, [0, 1], ['2.5%', '-2.5%']);
    const imageY = useTransform(sy, [0, 1], ['2.5%', '-2.5%']);
    const glareX = useTransform(sx, v => `${v * 100}%`);
    const glareY = useTransform(sy, v => `${v * 100}%`);
    const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,245,230,0.28), transparent 50%)`;

    const onPointerMove = (e: React.PointerEvent) => {
        if (reduce || e.pointerType !== 'mouse' || !cardRef.current) return;
        const r = cardRef.current.getBoundingClientRect();
        px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
        py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    };
    const onPointerLeave = () => { px.set(0.5); py.set(0.5); };

    const once = (initial: TargetAndTransition, animate: TargetAndTransition, transition: Transition) =>
        reduce ? {} : { initial, whileInView: animate, viewport: { once: true, margin: '-10% 0px' }, transition };
    const reveal = (delay: number) => once({ opacity: 0, y: 28 }, { opacity: 1, y: 0 }, { duration: 1, delay, ease: EASE });

    const Heading = sectionId ? 'h2' : 'h1';
    const words = sectionName.toUpperCase().split(/\s+/);
    // Size the name so its longest word always fits the measure on one line
    const longest = Math.max(...words.map(w => w.length), 4);
    let letter = 0;

    const photo = (slide: { src: string; alt: string }, visibility: string) => (
        <motion.img
            src={getHeroImageUrl(slide.src)}
            alt={slide.alt}
            loading="lazy"
            decoding="async"
            style={reduce ? undefined : { x: imageX, y: imageY }}
            className={`${visibility} ken-burns-active absolute -inset-[5%] w-[110%] h-[110%] max-w-none object-cover`}
        />
    );

    return (
        <section
            id={sectionId}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={`relative ${sectionId ? 'py-24 md:py-36' : 'min-h-[100dvh] pt-32 md:pt-40 pb-20'} overflow-hidden`}
        >
            {/* Ambient light */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="soon-blob absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(163,201,226,0.35),transparent_60%)] dark:bg-[radial-gradient(circle,rgba(74,106,140,0.28),transparent_60%)]" />
                <div className="soon-blob soon-blob--late absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full bg-[radial-gradient(circle,rgba(226,160,113,0.28),transparent_60%)] dark:bg-[radial-gradient(circle,rgba(226,160,113,0.16),transparent_60%)]" />
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-5 md:px-12">
                {/* Eyebrow */}
                <motion.div {...reveal(0)} className="flex items-center gap-4 mb-6 md:mb-10">
                    <span className="relative flex w-2.5 h-2.5">
                        <span className="absolute inset-0 rounded-full bg-alpine-sunrise animate-ping opacity-70" />
                        <span className="relative w-2.5 h-2.5 rounded-full bg-alpine-sunrise" />
                    </span>
                    <span className="text-xs md:text-sm font-bold uppercase tracking-[0.35em] text-alpine-navy/70 dark:text-white/70">In development</span>
                    <span className="hidden sm:block h-px flex-1 max-w-xs bg-gradient-to-r from-alpine-navy/25 dark:from-white/25 to-transparent" />
                </motion.div>

                {/* The name, huge */}
                <Heading aria-label={`${sectionName} — coming soon`} className="m-0">
                    <span
                        aria-hidden="true"
                        style={{ ['--len' as string]: longest }}
                        className="block font-serif font-medium uppercase leading-[0.88] tracking-[-0.02em] text-[min(10rem,calc(112vw/var(--len)))] text-alpine-navy dark:text-alpine-snow"
                    >
                        {words.map((word, wi) => (
                            <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.06em] mr-[0.22em] last:mr-0">
                                {splitGraphemes(word).map((ch, ci) => (
                                    <motion.span
                                        key={ci}
                                        className="inline-block"
                                        {...once({ y: '105%' }, { y: '0%' }, { duration: 1.1, delay: 0.1 + (letter++) * 0.04, ease: EASE })}
                                    >
                                        {ch}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </span>
                    <span aria-hidden="true" className="block overflow-hidden pb-[0.12em] md:pl-[8%]">
                        <motion.span
                            className="soon-gradient inline-block font-serif italic font-light leading-[0.95] text-[clamp(3.2rem,12.5vw,10.5rem)] pr-[0.08em]"
                            {...once({ y: '100%', opacity: 0 }, { y: '0%', opacity: 1 }, { duration: 1.3, delay: 0.45, ease: EASE })}
                        >
                            Coming soon
                        </motion.span>
                    </span>
                </Heading>

                <div className="mt-12 md:mt-20 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
                    {/* Photo card */}
                    <div className="[perspective:1400px]">
                        <motion.div
                            ref={cardRef}
                            {...once({ clipPath: 'inset(18% 18% 18% 18% round 28px)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', opacity: 1 }, { duration: 1.6, delay: 0.3, ease: EASE })}
                            style={reduce ? undefined : { rotateX, rotateY }}
                            className="relative aspect-[4/3] rounded-[28px] overflow-hidden bg-alpine-navy shadow-[0_40px_90px_-30px_rgba(8,40,76,0.55)] dark:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
                        >
                            {photo(sceneImages.posterDay, 'dark:hidden')}
                            {photo(sceneImages.posterNight, 'hidden dark:block')}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#04101F]/80 via-[#04101F]/10 to-transparent" />
                            {!reduce && <motion.div style={{ background: glare }} className="absolute inset-0 pointer-events-none mix-blend-screen" />}

                            <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7 flex items-end justify-between gap-4 text-white">
                                <div>
                                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/70 mb-2">Launching this season</p>
                                    <p className="font-serif text-2xl md:text-4xl leading-none">{sectionName}</p>
                                </div>
                                <span className="shrink-0 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em]">
                                    {new Date().getFullYear()}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Details */}
                    <div>
                        <motion.p {...reveal(0.35)} className="text-lg md:text-2xl font-light leading-relaxed text-alpine-navy/80 dark:text-white/75 max-w-xl">
                            We're building something worth the climb. <span className="text-alpine-navy dark:text-white font-normal">{sectionName}</span> opens here soon, crafted with the same care as every expedition.
                        </motion.p>

                        <motion.ul {...reveal(0.5)} className="mt-10 grid grid-cols-2 gap-3">
                            {MILESTONES.map((m, i) => {
                                const current = !m.done && MILESTONES[i - 1]?.done;
                                return (
                                    <li key={m.label} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                                        current ? 'border-alpine-sunrise/50 bg-alpine-sunrise/10 text-alpine-navy dark:text-white'
                                        : m.done ? 'border-alpine-navy/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] text-alpine-navy dark:text-white/85'
                                        : 'border-dashed border-alpine-navy/15 dark:border-white/15 text-alpine-navy/45 dark:text-white/40'}`}>
                                        <span className={`grid place-items-center w-5 h-5 shrink-0 rounded-full ${m.done ? 'bg-alpine-sunrise text-white' : current ? 'border-2 border-alpine-sunrise' : 'border border-current'}`}>
                                            {m.done && <Check size={12} strokeWidth={3} />}
                                            {current && <span className="w-1.5 h-1.5 rounded-full bg-alpine-sunrise animate-pulse" />}
                                        </span>
                                        {m.label}
                                    </li>
                                );
                            })}
                        </motion.ul>

                        <motion.div {...reveal(0.65)} className="mt-10 flex flex-wrap gap-3">
                            {!sectionId && (
                                <Link to="/" className="group inline-flex items-center gap-2.5 rounded-full bg-alpine-navy text-white dark:bg-white dark:text-black px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to home
                                </Link>
                            )}
                            <Link to="/contact" className="group inline-flex items-center gap-2.5 rounded-full border border-alpine-navy/20 dark:border-white/20 px-6 py-3.5 text-sm font-semibold text-alpine-navy dark:text-white hover:bg-alpine-navy/5 dark:hover:bg-white/10 transition-colors">
                                Ask the crew
                                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
