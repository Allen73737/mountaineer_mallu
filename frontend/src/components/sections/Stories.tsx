import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';

const STORIES = [
    { id: 1, title: 'The Eiger North Face', author: 'Rahul Krishnan', region: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Dolomites Sunrise', author: 'Arun Thomas', region: 'Italy', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Mont Blanc Circuit', author: 'Nithin Varghese', region: 'France', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'Zugspitze Summit', author: 'Sneha Nair', region: 'Germany', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800&auto=format&fit=crop' },
    { id: 5, title: 'Matterhorn Ascent', author: 'Vivek G.', region: 'Switzerland', image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a86?q=80&w=800&auto=format&fit=crop' }
];

export const Stories = () => {
    const { t } = useTranslation();
    const translationScope = useStore((state) => state.translationScope);
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % STORIES.length);
        setProgress(0);
    }, []);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + STORIES.length) % STORIES.length);
        setProgress(0);
    }, []);

    // Auto-play + progress bar
    useEffect(() => {
        timerRef.current = setInterval(nextSlide, 5000);
        progressRef.current = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 100));
        }, 100);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [nextSlide, activeIndex]);

    const handleManualInteraction = (action: 'next' | 'prev') => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
        if (action === 'next') nextSlide();
        if (action === 'prev') prevSlide();
        timerRef.current = setInterval(nextSlide, 5000);
        progressRef.current = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 100));
        }, 100);
    };

    const getCardStyle = (index: number) => {
        const diff = (index - activeIndex + STORIES.length) % STORIES.length;
        if (diff === 0) return { zIndex: 30, x: '0%', scale: 1, rotateY: 0, opacity: 1, filter: 'blur(0px)' };
        if (diff === 1 || diff === 2) return { zIndex: 20 - diff, x: `${diff * 55}%`, scale: 0.82 - (diff * 0.08), rotateY: -30, opacity: 1 - (diff * 0.25), filter: `blur(${diff * 2}px)` };
        const leftDiff = STORIES.length - diff;
        if (leftDiff === 1 || leftDiff === 2) return { zIndex: 20 - leftDiff, x: `-${leftDiff * 55}%`, scale: 0.82 - (leftDiff * 0.08), rotateY: 30, opacity: 1 - (leftDiff * 0.25), filter: `blur(${leftDiff * 2}px)` };
        return { zIndex: 0, x: '0%', scale: 0.5, opacity: 0, filter: 'blur(10px)' };
    };

    return (
        <section id="stories" className="py-20 md:py-28 px-6 md:px-12 relative z-10 bg-alpine-snow dark:bg-black overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,201,226,0.8) 0%, transparent 60%)' }} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6 }}
                            className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3 md:mb-4"
                        >
                            {t('stories.title')}
                        </motion.p>
                        <motion.h2
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1, type: "spring", damping: 15 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif mb-3 md:mb-4 text-alpine-navy dark:text-alpine-snow"
                        >
                            {t('stories.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl font-light text-base md:text-xl"
                        >
                            {t('stories.subtitle')}
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
                    >
                        <Link
                            to="/stories"
                            className="hidden md:flex items-center gap-2 group text-alpine-glacier dark:text-alpine-sunrise transition-colors"
                        >
                            <span className="font-medium tracking-wide">{t('stories.view_all')}</span>
                            <div className="bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* 3D Coverflow Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative w-full h-[55vh] md:h-[65vh] lg:h-[70vh] flex items-center justify-center perspective-[1500px]"
                >
                    {STORIES.map((story, i) => {
                        const style = getCardStyle(i);
                        const isActive = i === activeIndex;

                        const displayTitle = translationScope === 'everything' 
                            ? t(`dynamic_stories.${story.id}.title`, { defaultValue: story.title }) 
                            : story.title;
                            
                        const displayRegion = translationScope === 'everything' 
                            ? t(`dynamic_stories.${story.id}.region`, { defaultValue: story.region }) 
                            : story.region;

                        return (
                            <motion.div
                                key={story.id}
                                animate={style}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                                className={`absolute w-[75vw] md:w-[35vw] lg:w-[25vw] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ${isActive ? 'cursor-default' : 'cursor-pointer'} transform-style-3d`}
                                onClick={() => {
                                    if (!isActive) {
                                        if (timerRef.current) clearInterval(timerRef.current);
                                        if (progressRef.current) clearInterval(progressRef.current);
                                        setActiveIndex(i);
                                        setProgress(0);
                                        timerRef.current = setInterval(nextSlide, 5000);
                                        progressRef.current = setInterval(() => {
                                            setProgress(prev => Math.min(prev + 2, 100));
                                        }, 100);
                                    }
                                }}
                            >
                                <img
                                    src={story.image}
                                    alt={displayTitle}
                                    className={`w-full h-full object-cover transition-transform duration-[4000ms] ${isActive ? 'scale-110' : 'scale-100'}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5 transition-opacity duration-700" style={{ opacity: isActive ? 0.95 : 0.6 }} />

                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white text-left transform translate-z-10">
                                    <motion.div animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }} transition={{ duration: 0.5 }}>
                                        <div className="flex items-center gap-2 text-alpine-glacier mb-3 md:mb-4">
                                            <MapPin size={14} />
                                            <span className="text-xs md:text-sm font-semibold tracking-wider uppercase">{displayRegion}</span>
                                        </div>
                                        <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 text-shadow-lg leading-tight">
                                            {displayTitle}
                                        </h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <p className="text-white/80 font-light text-sm md:text-base">By {story.author}</p>
                                            <Link to={`/stories/${story.id}`}>
                                                <div className="bg-white/10 p-2.5 md:p-3 rounded-full hover:bg-white/20 transition-colors">
                                                    <ArrowRight size={16} className="text-alpine-sunrise" />
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Navigation Controls */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1 md:px-0 z-40 pointer-events-none">
                        <button
                            onClick={() => handleManualInteraction('prev')}
                            className="pointer-events-auto p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => handleManualInteraction('next')}
                            className="pointer-events-auto p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </motion.div>

                {/* Progress Dots + Bar */}
                <div className="flex flex-col items-center gap-4 mt-6 md:mt-10">
                    <div className="flex items-center gap-2 md:gap-3">
                        {STORIES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setActiveIndex(i);
                                    setProgress(0);
                                }}
                                className="relative"
                            >
                                <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-alpine-glacier dark:bg-alpine-sunrise scale-125' : 'bg-black/15 dark:bg-white/15 hover:bg-black/30 dark:hover:bg-white/30'}`} />
                                {i === activeIndex && (
                                    <motion.div
                                        layoutId="story-dot-ring"
                                        className="absolute -inset-1 rounded-full border border-alpine-glacier/40 dark:border-alpine-sunrise/40"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    {/* Progress bar for auto-advance */}
                    <div className="w-24 md:w-32 h-[2px] bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-alpine-glacier/50 dark:bg-alpine-sunrise/50 rounded-full"
                            style={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                </div>

                {/* Mobile View All Button */}
                <div className="mt-8 flex justify-center md:hidden">
                    <Link
                        to="/stories"
                        className="flex items-center gap-2 text-base group text-alpine-glacier dark:text-alpine-sunrise font-medium"
                    >
                        {t('stories.view_all')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
