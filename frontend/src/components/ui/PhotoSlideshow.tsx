import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export interface SlideshowImage { src: string; alt: string }

interface PhotoSlideshowProps {
    slides: SlideshowImage[];
    /** ms each photo stays before the crossfade starts */
    interval?: number;
    /** Load the first photo eagerly with high priority (LCP image) */
    priority?: boolean;
    /** Story-style progress segments along the top edge */
    showProgress?: boolean;
    className?: string;
    imgClassName?: string;
}

// Each slide drifts a different way so consecutive photos never feel repetitive
const DRIFTS = [
    { x: '-2%', y: '-1.5%', origin: '30% 40%' },
    { x: '2%', y: '-1%', origin: '70% 35%' },
    { x: '-1.5%', y: '1%', origin: '50% 60%' },
    { x: '1.5%', y: '1.5%', origin: '40% 30%' },
    { x: '0%', y: '-2%', origin: '60% 50%' },
];

const FADE_S = 1.6;

/**
 * Crossfading photo slideshow with Ken Burns drift.
 * - The next photo is fetched *and decoded* before it fades in (no blank frames / decode jank).
 * - Only the current + outgoing image are in the DOM.
 * - Drift is a compositor-only CSS transform; the crossfade is opacity only.
 * - Pauses while the tab is hidden; no autoplay for reduced-motion users.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({
    slides, interval = 7000, priority = false, showProgress = false, className = '', imgClassName = '',
}) => {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);
    const decoded = useRef(new Set<string>());
    const failed = useRef(new Set<string>());
    const slidesKey = slides.map(s => s.src).join('|');

    // New set (e.g. theme switch) → start from the top
    useEffect(() => { setIndex(0); }, [slidesKey]);

    useEffect(() => {
        if (reduce || slides.length < 2) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;

        const advance = async () => {
            // Next slide, skipping any that already failed to load
            let next = (index + 1) % slides.length;
            for (let guard = 0; failed.current.has(slides[next].src) && guard < slides.length; guard++) {
                next = (next + 1) % slides.length;
            }
            if (next === index) return;
            const src = slides[next].src;
            if (!decoded.current.has(src)) {
                try {
                    const img = new Image();
                    img.src = src;
                    await img.decode();
                    decoded.current.add(src);
                } catch {
                    // Couldn't load — remember it and try the following slide instead of showing a broken frame
                    failed.current.add(src);
                    if (!cancelled) timer = setTimeout(advance, 0);
                    return;
                }
            }
            if (!cancelled && !document.hidden) setIndex(next);
            else if (!cancelled) timer = setTimeout(advance, 1000);
        };

        timer = setTimeout(advance, interval);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [index, interval, reduce, slides]);

    const slide = slides[index] ?? slides[0];
    if (!slide) return null;
    const drift = DRIFTS[index % DRIFTS.length];
    const driftSeconds = (interval + FADE_S * 1000 * 2) / 1000;

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <AnimatePresence initial={false}>
                <motion.img
                    key={slide.src}
                    src={slide.src}
                    alt={slide.alt}
                    loading={priority && index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={priority && index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    draggable={false}
                    className={`photo-slide absolute inset-0 w-full h-full object-cover select-none ${imgClassName}`}
                    style={reduce ? undefined : ({
                        '--kb-x': drift.x,
                        '--kb-y': drift.y,
                        transformOrigin: drift.origin,
                        animationDuration: `${driftSeconds}s`,
                    } as React.CSSProperties)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: FADE_S, ease: [0.4, 0, 0.2, 1] }}
                />
            </AnimatePresence>

            {showProgress && slides.length > 1 && (
                <div className="absolute top-0 inset-x-0 z-20 flex gap-1.5 px-10 xl:px-12 pt-5" aria-hidden="true">
                    {slides.map((s, i) => (
                        <span key={s.src} className="relative flex-1 h-[2px] rounded-full bg-white/25 overflow-hidden">
                            <span
                                key={i === index ? `active-${index}` : `idle-${i}`}
                                className={`absolute inset-0 origin-left rounded-full bg-white/90 ${i === index && !reduce ? 'photo-progress' : ''}`}
                                style={{
                                    transform: i < index ? 'scaleX(1)' : i === index && !reduce ? undefined : 'scaleX(0)',
                                    animationDuration: `${interval}ms`,
                                }}
                            />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
