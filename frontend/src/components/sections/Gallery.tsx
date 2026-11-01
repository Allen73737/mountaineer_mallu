import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, MotionValue, useAnimationControls, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X } from 'lucide-react';
import { useLenis } from '../ui/SmoothScrollProvider';
import { useReelGL } from '../ui/ReelGL';
import { useQuality, atLeast } from '../../lib/quality';
import { useTranslation } from 'react-i18next';
import { PremiumVideoPlayer } from '../ui/PremiumVideoPlayer';
import { Magnetic } from '../ui/Magnetic';
import { LineReveal } from '../ui/LineReveal';
import { useLiveContent } from '../../lib/useLiveContent';
import { galleryApi } from '../../lib/api';

// Sample reel shown until the API answers (and kept if nothing is approved yet). The two former video
// samples pointed at Vimeo links that no longer resolve, so they are stills now; real uploads can be video.
const MEDIA: { id: number; type: string; url: string; title: string; subtitle: string }[] = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop', title: 'Glacier Walk', subtitle: 'Khumbu Icefall' },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop', title: 'Summit Ascent', subtitle: 'Hillary Step' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?q=80&w=1600&auto=format&fit=crop', title: 'Rest Camp', subtitle: 'Camp III' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop', title: 'Snow Ridge', subtitle: 'Lhotse Face' },
    { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?q=80&w=1600&auto=format&fit=crop', title: 'Whiteout', subtitle: 'South Col' },
    { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1516655855035-d5215bcb5604?q=80&w=1600&auto=format&fit=crop', title: 'The Descent', subtitle: 'Basecamp Return' },
];
type Media = typeof MEDIA[number];

const pad = (n: number) => String(n).padStart(2, '0');

const FrameMedia = ({ item }: { item: Media }) => item.type === 'video' ? (
    <PremiumVideoPlayer src={item.url} isActive={true} autoPlay={true} className="w-full h-full object-cover" />
) : (
    // Frames are at most ~640px wide; request a matching size instead of the 1600px original
    // crossOrigin so the WebGL reel can sample the same (cached) image
    <img data-reel-img crossOrigin="anonymous" src={item.url.replace('w=1600', 'w=960')} alt={item.title} className="w-full h-full object-cover" loading="eager" decoding="async" draggable={false} />
);

/** One frame of the reel. It is "in the gate" (full brightness, slight lift) while the reel centres it. */
const Frame = ({ item, index, count, progress, onOpen }: { item: Media; index: number; count: number; progress: MotionValue<number>; onOpen: (item: Media, el: HTMLElement) => void }) => {
    const c = index / (count - 1);
    const w = 0.7 / (count - 1);
    const shade = useTransform(progress, [c - w, c, c + w], [0.55, 0, 0.55]);
    const scale = useTransform(progress, [c - w, c, c + w], [0.92, 1, 0.92]);
    const captionY = useTransform(progress, [c - w * 0.6, c, c + w * 0.6], [16, 0, 16]);
    const captionOpacity = useTransform(progress, [c - w * 0.6, c, c + w * 0.6], [0, 1, 0]);

    return (
        <motion.div style={{ scale }} className="relative shrink-0 w-[78vw] sm:w-[60vw] md:w-[46vw] lg:w-[38vw] max-w-[640px] flex flex-col">
            <div className="flex justify-between font-mono text-[10px] tracking-[0.3em] text-white/45 px-1 mb-2">
                <span>FR {pad(item.id)}</span>
                <span>{item.type === 'video' ? 'REEL' : 'STILL'} · 35MM</span>
            </div>
            <Link
                to="/gallery"
                data-cursor={item.type === 'video' ? 'play' : 'view'}
                className={`relative block aspect-[4/3] rounded-md overflow-hidden ring-1 ring-white/10 ${item.type === 'video' ? 'bg-black' : ''}`}
                aria-label={`${item.title} — view full screen`}
                onClick={e => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    onOpen(item, e.currentTarget);
                }}
            >
                <FrameMedia item={item} />
                <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-[#03070E] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                <motion.div style={{ y: captionY, opacity: captionOpacity }} className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white pointer-events-none">
                    <div className="flex items-center gap-3 mb-2">
                        {item.type === 'video' && <Play className="w-3.5 h-3.5" fill="currentColor" />}
                        <span className="w-8 h-px bg-white/50" />
                        <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/75">{item.subtitle}</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-4xl font-light">{item.title}</h3>
                </motion.div>
            </Link>
        </motion.div>
    );
};

/**
 * Full-screen viewer for one frame of the reel. The frame lifts off from its spot in the strip and
 * grows to fill the screen at the photo's own aspect ratio, then flies back to the strip on close.
 */
const ReelLightbox = ({ item, from, onClose }: { item: Media; from: HTMLElement; onClose: () => void }) => {
    const controls = useAnimationControls();
    const { lenis } = useLenis();
    const [aspect, setAspect] = useState(4 / 3);

    const target = () => {
        const maxW = window.innerWidth * 0.9, maxH = window.innerHeight * 0.78;
        const width = Math.min(maxW, maxH * aspect), height = width / aspect;
        return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2 - window.innerHeight * 0.03, width, height, borderRadius: 4 };
    };
    const origin = () => {
        const r = from.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 6 };
    };

    const close = async () => {
        await controls.start({ ...origin(), transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } });
        onClose();
    };

    useEffect(() => {
        controls.set(origin());
        controls.start({ ...target(), transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } });
        lenis?.stop();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => { lenis?.start(); window.removeEventListener('keydown', onKey); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Re-fit once the real aspect ratio is known
    useEffect(() => {
        controls.start({ ...target(), transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aspect]);

    return createPortal(
        <div className="fixed inset-0 z-[9992]" role="dialog" aria-modal="true" aria-label={item.title}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} onClick={close} className="absolute inset-0 bg-[#030810]/92 backdrop-blur-sm" />
            <motion.div animate={controls} className="absolute overflow-hidden bg-black shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
                {item.type === 'video'
                    ? <video src={item.url} autoPlay loop muted playsInline className="w-full h-full object-cover" onLoadedMetadata={e => setAspect(e.currentTarget.videoWidth / e.currentTarget.videoHeight || 16 / 9)} />
                    : <img src={item.url.replace('w=1600', 'w=2400')} alt={item.title} className="w-full h-full object-cover" onLoad={e => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] } }} exit={{ opacity: 0 }}
                className="absolute inset-x-0 bottom-0 px-5 md:px-12 pb-6 md:pb-8 flex flex-wrap items-end justify-between gap-4 text-white pointer-events-none"
            >
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/55 mb-2">FR {pad(item.id)} · {item.subtitle}</p>
                    <h3 className="font-serif text-3xl md:text-5xl">{item.title}</h3>
                </div>
                <Link to="/gallery" className="pointer-events-auto group inline-flex items-center gap-3 rounded-full border border-white/25 px-5 py-2.5 text-sm hover:bg-white hover:text-alpine-navy transition-colors">
                    Open the vault <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
            <button onClick={close} aria-label="Close" className="absolute top-5 right-5 md:top-8 md:right-8 grid place-items-center w-12 h-12 rounded-full bg-white text-alpine-navy hover:rotate-90 transition-transform duration-500 cursor-pointer">
                <X size={18} />
            </button>
        </div>,
        document.body,
    );
};

/**
 * Home gallery as a film reel. The section pins for as long as the strip is wider than the screen
 * and vertical scroll slides the frames sideways past a centred "gate", sprocket holes and frame
 * numbers included. Section height is measured from the strip so the pin lasts exactly one pass.
 * Reduced motion gets a plain horizontally scrollable strip instead.
 */
export const Gallery = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);
    // Approved community uploads from the API (frame numbers stay 01, 02, ...); the samples above until they arrive
    const media = useLiveContent<Media>(MEDIA, async () => (await galleryApi.list(1, 6)).items.slice(0, 6).map((m: any, i: number) => ({
        id: i + 1, type: m.type === 'video' ? 'video' : 'image', url: m.url, title: m.title || 'Untitled', subtitle: 'From the community',
    })));
    const trackRef = useRef<HTMLDivElement>(null);
    const [travel, setTravel] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(track);
        window.addEventListener('resize', measure, { passive: true });
        return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
    }, []);

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
    const counter = useTransform(scrollYProgress, p => `${pad(Math.min(media.length, Math.floor(p * (media.length - 0.001)) + 1))}`);
    const [frameLabel, setFrameLabel] = useState('01');
    useEffect(() => counter.on('change', setFrameLabel), [counter]);

    // WebGL pass over the stills (bow + colour split with speed, ripple on hover)
    const tier = useQuality(s => s.tier);
    const stageRef = useRef<HTMLDivElement>(null);
    const glHostRef = useRef<HTMLDivElement>(null);
    const dragVelocity = useRef(0);
    useReelGL(stageRef, trackRef, glHostRef, dragVelocity, !reduce && atLeast(tier, 'medium'), media.map(m => m.url).join('|'));

    // Grab the reel and pull it: horizontal drag scrubs the page scroll that drives the strip (mouse / pen)
    const { lenis } = useLenis();
    const drag = useRef({ active: false, x: 0, moved: 0 });
    const onPointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        drag.current = { active: true, x: e.clientX, moved: 0 };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current;
        if (!d.active) return;
        const dx = e.clientX - d.x;
        d.x = e.clientX;
        d.moved += Math.abs(dx);
        if (d.moved < 4) return;
        dragVelocity.current = -dx;
        if (lenis) lenis.scrollTo(lenis.scroll - dx, { immediate: true });
        else window.scrollBy(0, -dx);
    };
    const endDrag = () => { drag.current.active = false; };
    // A drag must not also count as a click on the frame under the pointer
    const onClickCapture = (e: React.MouseEvent) => {
        if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation(); }
        drag.current.moved = 0;
    };

    const [open, setOpen] = useState<{ item: Media; el: HTMLElement } | null>(null);
    const openFrame = (item: Media, el: HTMLElement) => setOpen({ item, el });

    const header = (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-8">
            <div>
                <p className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3">
                    {t('gallery.captured_moments', 'Captured Moments')}
                </p>
                <h2 className="cine-title has-lines text-4xl md:text-6xl lg:text-7xl font-serif mb-3 text-white">
                    <LineReveal>{t('gallery.title', 'The Summit Gallery')}</LineReveal>
                </h2>
                <p className="text-white/70 font-light max-w-xl text-base md:text-lg">
                    {t('gallery.subtitle', 'Glimpses into the raw beauty of our climbs. Real moments, unstaged and breathtaking.')}
                </p>
            </div>
            <div className="flex items-center gap-6">
                <span className="hidden md:block font-mono text-xs tracking-[0.3em] text-white/50">
                    <span className="text-white">{frameLabel}</span> / {pad(media.length)}
                </span>
                <Magnetic glow="rgba(163,201,226,0.5)">
                    <Link
                        to="/gallery"
                        className="group flex items-center gap-3 md:gap-4 text-white font-medium transition-colors text-sm md:text-base border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-alpine-blue dark:hover:text-black"
                    >
                        {t('gallery.view_more', 'Open Vault')}
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </Magnetic>
            </div>
        </div>
    );

    // Backdrop: applied to the 100svh stage, never to the tall pinned section (backdrop blur on ~5 screens of height is very expensive)
    const sectionClass = 'flashlight z-10 text-white bg-alpine-navy/85 bg-gradient-to-b from-alpine-navy/90 via-[#0b2d54]/85 to-alpine-navy/90 dark:bg-black/35 dark:bg-gradient-to-b dark:from-black/40 dark:via-black/20 dark:to-black/50';

    if (reduce) {
        return (
            <section id="gallery" className={`${sectionClass} relative pt-24 pb-24`}>
                {header}
                <div className="mt-12 flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 md:px-12 pb-4">
                    {media.map(item => (
                        <Link key={item.id} to="/gallery" className="snap-center shrink-0 w-[78vw] md:w-[40vw] max-w-[640px] aspect-[4/3] rounded-md overflow-hidden bg-black relative">
                            <FrameMedia item={item} />
                            <span className="absolute bottom-4 left-4 font-serif text-2xl">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="gallery"
            className="relative z-10 text-white"
            style={{ height: `calc(100svh + ${travel}px)` }}
        >
            <div ref={stageRef} className={`${sectionClass} sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center gap-8 md:gap-10 py-20`}>
                <div ref={glHostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />
                {header}

                {/* The reel */}
                <div
                    className="relative select-none cursor-grab active:cursor-grabbing"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerLeave={endDrag}
                    onPointerCancel={endDrag}
                    onClickCapture={onClickCapture}
                    onDragStart={e => e.preventDefault()}
                >
                    <div className="film-sprockets mb-3" aria-hidden="true" />
                    <motion.div
                        ref={trackRef}
                        style={{ x }}
                        className="flex gap-5 md:gap-8 w-max will-change-transform"
                    >
                        {/* Leader/trailer padding so the first and last frames can stop in the centre gate */}
                        <div className="shrink-0 w-[calc(11vw-1.25rem)] sm:w-[calc(20vw-1.25rem)] md:w-[calc(27vw-2rem)] lg:w-[calc(50vw-min(19vw,320px)-2rem)]" aria-hidden="true" />
                        {media.map((item, i) => (
                            <Frame key={item.id} item={item} index={i} count={media.length} progress={scrollYProgress} onOpen={openFrame} />
                        ))}
                        <div className="shrink-0 w-[calc(11vw-1.25rem)] sm:w-[calc(20vw-1.25rem)] md:w-[calc(27vw-2rem)] lg:w-[calc(50vw-min(19vw,320px)-2rem)]" aria-hidden="true" />
                    </motion.div>
                    <div className="film-sprockets mt-3" aria-hidden="true" />
                </div>

                {/* Reel progress */}
                <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12">
                    <div className="relative h-px bg-white/15 overflow-hidden">
                        <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-0 origin-left bg-gradient-to-r from-alpine-glacier via-alpine-sunrise to-alpine-gold" />
                    </div>
                    <p className="hidden md:block mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Drag the reel · click a frame</p>
                </div>
            </div>
            <AnimatePresence>
                {open && <ReelLightbox key={open.item.id} item={open.item} from={open.el} onClose={() => setOpen(null)} />}
            </AnimatePresence>
        </section>
    );
};
