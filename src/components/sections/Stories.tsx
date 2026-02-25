import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORIES = [
    { id: 1, title: 'The Eiger North Face', author: 'Rahul Krishnan', region: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Dolomites Sunrise', author: 'Arun Thomas', region: 'Italy', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Mont Blanc Circuit', author: 'Nithin Varghese', region: 'France', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'Zugspitze Summit', author: 'Sneha Nair', region: 'Germany', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800&auto=format&fit=crop' },
    { id: 5, title: 'Matterhorn Ascent', author: 'Vivek G.', region: 'Switzerland', image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a86?q=80&w=800&auto=format&fit=crop' }
];

export const Stories = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % STORIES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + STORIES.length) % STORIES.length);
    }, []);

    // Auto-play mechanic
    useEffect(() => {
        timerRef.current = setInterval(nextSlide, 4000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [nextSlide]);

    const handleManualInteraction = (action: 'next' | 'prev') => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (action === 'next') nextSlide();
        if (action === 'prev') prevSlide();
        // Restart timer
        timerRef.current = setInterval(nextSlide, 5000);
    };

    const getCardStyle = (index: number) => {
        const diff = (index - activeIndex + STORIES.length) % STORIES.length;
        // 0 = center, 1 = right, last = left

        // Front Center
        if (diff === 0) {
            return { zIndex: 30, x: '0%', scale: 1, rotateY: 0, opacity: 1, filter: 'blur(0px)' };
        }
        // Right Wing
        if (diff === 1 || diff === 2) {
            return { zIndex: 20 - diff, x: `${diff * 60}%`, scale: 0.8 - (diff * 0.1), rotateY: -35, opacity: 1 - (diff * 0.2), filter: `blur(${diff * 2}px)` };
        }
        // Left Wing
        const leftDiff = STORIES.length - diff;
        if (leftDiff === 1 || leftDiff === 2) {
            return { zIndex: 20 - leftDiff, x: `-${leftDiff * 60}%`, scale: 0.8 - (leftDiff * 0.1), rotateY: 35, opacity: 1 - (leftDiff * 0.2), filter: `blur(${leftDiff * 2}px)` };
        }

        // Hidden Back
        return { zIndex: 0, x: '0%', scale: 0.5, opacity: 0, filter: 'blur(10px)' };
    };

    return (
        <section id="stories" className="py-24 px-6 md:px-12 relative z-10 bg-alpine-snow dark:bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <motion.h2
                            initial={{ y: 50, opacity: 0, rotateX: 45 }}
                            whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1, type: "spring", damping: 15 }}
                            className="text-5xl md:text-7xl font-serif mb-4 text-alpine-navy dark:text-alpine-snow"
                        >
                            Expedition Stories
                        </motion.h2>
                        <motion.p
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl font-light text-xl"
                        >
                            Chronicles from our community. True tales of endurance, breathtaking views, and the spirit of the mountains.
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
                            <span className="font-medium">View Chronicle</span>
                            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
                    className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center perspective-[1500px]"
                >
                    {STORIES.map((story, i) => {
                        const style = getCardStyle(i);
                        const isActive = i === activeIndex;

                        return (
                            <motion.div
                                key={story.id}
                                animate={style}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                                className={`absolute w-[80vw] md:w-[35vw] lg:w-[25vw] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl ${isActive ? 'cursor-default' : 'cursor-pointer'} transform-style-3d`}
                                onClick={() => {
                                    if (!isActive) {
                                        if (timerRef.current) clearInterval(timerRef.current);
                                        setActiveIndex(i);
                                        timerRef.current = setInterval(nextSlide, 5000);
                                    }
                                }}
                            >
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className={`w-full h-full object-cover transition-transform duration-[4000ms] ${isActive ? 'scale-110' : 'scale-100'}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-700" style={{ opacity: isActive ? 0.9 : 0.6 }} />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white text-left transform translate-z-10">
                                    <motion.div animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }} transition={{ duration: 0.5 }}>
                                        <div className="flex items-center gap-2 text-alpine-glacier mb-4">
                                            <MapPin size={18} />
                                            <span className="text-sm font-semibold tracking-wider uppercase">{story.region}</span>
                                        </div>
                                        <h3 className="font-serif text-3xl md:text-4xl mb-4 text-shadow-lg leading-tight">
                                            {story.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <p className="text-white/80 font-light text-base">By {story.author}</p>
                                            <Link to={`/stories/${story.id}`}>
                                                <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                                                    <ArrowRight size={20} className="text-alpine-sunrise" />
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Navigation Controls */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 md:px-0 z-40 pointer-events-none">
                        <button
                            onClick={() => handleManualInteraction('prev')}
                            className="pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={() => handleManualInteraction('next')}
                            className="pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </motion.div>

                {/* Mobile View All Button */}
                <div className="mt-8 flex justify-center md:hidden">
                    <Link
                        to="/stories"
                        className="flex items-center gap-2 text-lg group text-alpine-glacier dark:text-alpine-sunrise font-medium"
                    >
                        Deploy Chronicle <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
