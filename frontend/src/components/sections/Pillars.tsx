import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useScroll, useMotionValueEvent } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';
import { Loader2 } from '../ui/BrandLoader';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pillarsApi } from '../../lib/api';
import { LineReveal } from '../ui/LineReveal';

const DEFAULT_LEADERS = [
    {
        _id: 'leader-1',
        name: 'Arun Thomas',
        role: 'Chief Expedition Leader',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        quote: 'Mountains do not distinguish between who you are. They reward preparation, humility, and heart.',
    },
    {
        _id: 'leader-2',
        name: 'Rahul Krishnan',
        role: 'Alpine Safety & High Route Spec',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        quote: 'The real summit is getting every single climber back down safely together.',
    },
    {
        _id: 'leader-3',
        name: 'Sneha Nair',
        role: 'Logistics & Community Director',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
        quote: 'We created this family so no Malayalee hiker ever climbs European peaks alone.',
    },
];

export const Pillars = () => {
    const { t } = useTranslation();
    const [leaders, setLeaders] = useState<any[]>(DEFAULT_LEADERS);
    const [topIndex, setTopIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });
    const controls = useAnimation();

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const data = await pillarsApi.list();
                if (data && data.length > 0) {
                    setLeaders(data);
                }
            } catch (err) {
                // Keep default leaders
            }
        };
        fetchLeaders();
    }, []);

    // Gentle auto-rotation when section is in view
    useEffect(() => {
        if (!isInView || isHovered || leaders.length <= 1) return;
        const interval = setInterval(() => {
            setTopIndex((prev) => (prev + 1) % leaders.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isInView, isHovered, leaders.length]);

    useEffect(() => {
        if (isInView && leaders.length > 0) {
            controls.start('visible');
        }
    }, [isInView, controls, leaders.length]);

    if (leaders.length === 0) return null;

    const handleNext = () => {
        setTopIndex((prev) => (prev + 1) % leaders.length);
    };

    return (
        <section id="team" className="relative py-20 md:py-32 bg-transparent dark:bg-transparent text-alpine-navy dark:text-alpine-snow overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-10 md:gap-12 items-center" ref={containerRef}>

                {/* Left Side Info */}
                <div className="md:w-1/2 min-w-min z-20 text-left">
                    <motion.p
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                        }}
                        className="text-alpine-blue dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                    >
                        {t('pillars.leadership_subtitle', 'Leadership')}
                    </motion.p>
                    <motion.h2
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, x: -30 },
                            visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 18 } }
                        }}
                        className="cine-title has-lines text-4xl md:text-6xl lg:text-7xl font-serif mb-4 md:mb-6 leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.12)]"
                    >
                        <LineReveal>{t('pillars.title', 'Pillars of the Community')}</LineReveal>
                    </motion.h2>
                    <motion.p
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 } }
                        }}
                        className="text-alpine-navy/70 dark:text-alpine-snow/70 font-light mb-8 md:mb-10 text-base md:text-xl lg:text-2xl max-w-lg mx-auto md:mx-0"
                    >
                        {t('pillars.subtitle', 'The heartbeat of Mountaineer Mallu. Our seasoned team leads ensure every expedition is safe, thrilling, and unforgettable.')}
                    </motion.p>

                    <motion.div
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
                        }}
                        className="flex items-center gap-6"
                    >
                        <Link to="/team" className="group inline-flex items-center gap-3 md:gap-4 text-alpine-blue dark:text-alpine-sunrise font-medium text-base md:text-lg w-max">
                            {t('pillars.meet_team', 'Meet the Full Core')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Interactive dots navigation */}
                    <div className="flex items-center gap-3 mt-8">
                        {leaders.map((leader, i) => (
                            <button
                                key={leader._id || i}
                                onClick={() => setTopIndex(i)}
                                aria-label={`View ${leader.name}`}
                                className={`tap-dot h-2.5 rounded-full transition-all duration-300 ${i === topIndex ? 'w-8 bg-alpine-blue dark:bg-alpine-sunrise' : 'w-2.5 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'}`}
                            />
                        ))}
                        <span className="text-xs text-alpine-navy/50 dark:text-alpine-snow/50 font-mono ml-2">
                            0{topIndex + 1} / 0{leaders.length}
                        </span>
                    </div>
                </div>

                {/* Right Side Stacked Spring Cards */}
                <div 
                    className="md:w-1/2 w-full h-[380px] md:h-[480px] relative perspective-[1000px] flex justify-center items-center cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleNext}
                    title="Click to view next leader"
                >
                    {leaders.map((leader, i) => {
                        const isExited = i < topIndex;
                        const stackPos = isExited ? (leaders.length - topIndex + i) : (i - topIndex);

                        return (
                            <motion.div
                                key={leader._id}
                                animate={{
                                    scale: 1 - stackPos * 0.05,
                                    y: stackPos * -16,
                                    x: stackPos * 16,
                                    zIndex: leaders.length - stackPos,
                                    opacity: stackPos > 2 ? 0 : 1 - stackPos * 0.15,
                                    rotateZ: stackPos * 2,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 26,
                                    mass: 0.4,
                                }}
                                className="absolute w-64 md:w-80 h-[340px] md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/15 transform-gpu select-none"
                            >
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-90" />

                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                                    <Quote size={24} className="text-white/30 mb-3 md:mb-4" />
                                    <p className="font-serif italic text-base md:text-lg mb-4 text-alpine-glacier drop-shadow-md leading-relaxed">
                                        "{leader.quote}"
                                    </p>

                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-1">{leader.name}</h3>
                                        <p className="text-xs md:text-sm tracking-widest uppercase text-alpine-sunrise font-semibold">{leader.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

