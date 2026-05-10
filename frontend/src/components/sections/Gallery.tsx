import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Play, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PremiumVideoPlayer } from '../ui/PremiumVideoPlayer';

const MEDIA = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', title: 'Glacier Walk' },
    { id: 2, type: 'video', url: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27ee2bb3c81e8adbc9ccf066b1a37a5146ae9b6&profile_id=164&oauth2_token_id=57447761', title: 'Summit Ascent' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200&auto=format&fit=crop', title: 'Rest Camp' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop', title: 'Snow Ridge' },
];

export const Gallery = () => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });
    const controls = useAnimation();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % MEDIA.length);
            }, 5000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isInView, controls]);

    const handleManual = (direction: 1 | -1) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentIndex((prev) => (prev + direction + MEDIA.length) % MEDIA.length);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MEDIA.length);
        }, 6000);
    };

    return (
        <section id="gallery" className="py-20 md:py-28 px-6 md:px-12 bg-alpine-navy dark:bg-black text-alpine-snow overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto" ref={containerRef}>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6 md:gap-8 relative z-10">
                    <div>
                        <motion.p
                            initial="hidden"
                            animate={controls}
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            className="text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                        >
                            {t('gallery.captured_moments', 'Captured Moments')}
                        </motion.p>
                        <motion.h2
                            initial="hidden"
                            animate={controls}
                            variants={{
                                hidden: { opacity: 0, x: -100 },
                                visible: { opacity: 1, x: 0, transition: { type: 'spring', bounce: 0.5, duration: 1.5 } }
                            }}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4 md:mb-6 text-alpine-glacier text-shadow-md"
                        >
                            {t('gallery.title', 'Visual Archive')}
                        </motion.h2>
                        <motion.p
                            initial="hidden"
                            animate={controls}
                            variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.2 } }
                            }}
                            className="text-white/60 font-light max-w-xl text-base md:text-xl"
                        >
                            {t('gallery.subtitle', 'Glimpses into the raw beauty of our climbs. Real moments, unstaged and breathtaking.')}
                        </motion.p>
                    </div>
                    <motion.div
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, x: 50 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.4 } }
                        }}
                    >
                        <Link
                            to="/gallery"
                            className="group flex items-center gap-3 md:gap-4 text-alpine-sunrise font-medium hover:text-white transition-colors text-sm md:text-base"
                        >
                            {t('gallery.view_more', 'Open Vault')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Dynamic Parallax Full-width Slider */}
                <motion.div
                    initial="hidden"
                    animate={controls}
                    variants={{
                        hidden: { opacity: 0, y: 100 },
                        visible: { opacity: 1, y: 0, transition: { duration: 1, type: "spring" } }
                    }}
                    className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group"
                >
                    {MEDIA.map((item, i) => {
                        const isActive = i === currentIndex;
                        const xOffset = (i - currentIndex) * 100;
                        const innerParallax = (i - currentIndex) * -20;

                        return (
                            <motion.div
                                key={item.id}
                                animate={{
                                    x: `${xOffset}%`,
                                    opacity: Math.abs(i - currentIndex) <= 1 ? 1 : 0,
                                    zIndex: isActive ? 10 : 0
                                }}
                                transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <motion.div
                                    animate={{ x: `${innerParallax}%`, scale: isActive ? 1 : 1.1 }}
                                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                                    className="w-full h-full"
                                >
                                    {item.type === 'video' ? (
                                        <PremiumVideoPlayer
                                            src={item.url}
                                            isActive={isActive}
                                            autoPlay={isActive}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </motion.div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16 text-alpine-snow z-20 flex justify-between items-end">
                                    <motion.div
                                        animate={{ y: isActive ? 0 : 50, opacity: isActive ? 1 : 0 }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                            {item.type === 'video' && <Play className="text-alpine-sunrise w-6 h-6 md:w-8 md:h-8 opacity-80" fill="currentColor" />}
                                            <div className="w-8 md:w-12 h-[2px] bg-alpine-glacier" />
                                            <span className="tracking-[0.3em] uppercase text-xs md:text-sm font-semibold text-alpine-glacier">0{i + 1} / 0{MEDIA.length}</span>
                                        </div>
                                        <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl text-shadow-lg">{item.title}</h3>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Navigation — always visible on mobile, hover on desktop */}
                    <div className="absolute inset-y-0 left-4 right-4 md:left-auto md:right-8 flex md:flex-col justify-between md:justify-center items-center md:items-end gap-3 md:gap-4 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <button onClick={() => handleManual(-1)} className="pointer-events-auto p-3 md:p-4 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-alpine-sunrise hover:text-alpine-navy transition-colors self-center">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => handleManual(1)} className="pointer-events-auto p-3 md:p-4 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-alpine-sunrise hover:text-alpine-navy transition-colors self-center">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Progress indicators */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                        {MEDIA.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (timerRef.current) clearInterval(timerRef.current);
                                    setCurrentIndex(i);
                                    timerRef.current = setInterval(() => setCurrentIndex((prev) => (prev + 1) % MEDIA.length), 6000);
                                }}
                                className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-alpine-glacier' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
