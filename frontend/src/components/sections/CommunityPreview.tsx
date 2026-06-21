import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import { Users, MapPin, ArrowRight, ShieldCheck, Compass, Mountain, Map, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GROUPS = [
    { 
        id: 1, 
        name: 'Alpine Vanguards', 
        region: 'Chamonix, FR', 
        members: 128, 
        desc: 'Technical ascents and mixed climbing focus. High altitude experience required.', 
        icon: ShieldCheck,
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200&auto=format&fit=crop',
    },
    { 
        id: 2, 
        name: 'Bavarian Trekkers', 
        region: 'Munich, DE', 
        members: 450, 
        desc: 'Weekend hiking operations across the Zugspitze region. All levels welcome.', 
        icon: Compass,
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    },
    { 
        id: 3, 
        name: 'Dolomite Scramblers', 
        region: 'Cortina, IT', 
        members: 85, 
        desc: 'Via Ferrata, ridge traverses, and light mountaineering.', 
        icon: Mountain,
        image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop',
    },
    { 
        id: 4, 
        name: 'Swiss High Route', 
        region: 'Zermatt, CH', 
        members: 210, 
        desc: 'Multi-day hut-to-hut glacier expeditions and logistics planning.', 
        icon: Map,
        image: 'https://images.unsplash.com/photo-1516655855035-d5215bcb5604?q=80&w=1200&auto=format&fit=crop',
    },
    { 
        id: 5, 
        name: 'Nordic Trailblazers', 
        region: 'Tromsø, NO', 
        members: 156, 
        desc: 'Arctic circle expeditions and winter survival training. Auroral ascents.', 
        icon: Snowflake,
        image: 'https://images.unsplash.com/photo-1517823382935-51bfcb0ec6bc?q=80&w=1200&auto=format&fit=crop',
    }
];

export const CommunityPreview = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const total = GROUPS.length;
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        } else {
            controls.start('hidden');
        }
    }, [isInView, controls]);

    // Auto-cycle logic
    useEffect(() => {
        if (isHovered || !isInView) return; // Pause if hovered or out of view
        
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % total);
        }, 4000); // Rotate every 4 seconds

        return () => clearInterval(timer);
    }, [isHovered, total, isInView]);

    const activeGroup = GROUPS[activeIndex];
    const ActiveIcon = activeGroup.icon;

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30, transition: { duration: 0.5 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };
    
    const fadeUpDelayed = {
        hidden: { opacity: 0, y: 30, transition: { duration: 0.5 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.5 } },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.3, ease: "easeOut" } }
    };

    return (
        <section 
            id="community" 
            ref={sectionRef}
            className="min-h-[100dvh] flex flex-col justify-center py-16 md:py-24 px-6 md:px-12 relative z-10 bg-alpine-navy dark:bg-black overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
        >
            {/* Ambient Lighting behind the monolith */}
            <div className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] rounded-full bg-alpine-glacier/10 blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-[1600px] mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 relative z-20">
                    <motion.div 
                        variants={fadeUp}
                        initial="hidden"
                        animate={controls}
                        className="max-w-2xl"
                    >
                        <p className="text-alpine-glacier dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3">
                            {t('community.join_brotherhood', 'Global Factions')}
                        </p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white mb-4">
                            {t('community.title', 'Community')}
                        </h2>
                        <p className="text-white/60 font-light text-lg md:text-2xl leading-relaxed">
                            {t('community.subtitle', 'Join specialized factions. Coordinate expeditions, share intelligence, and find your ropemates.')}
                        </p>
                    </motion.div>
                    
                    <motion.div
                        variants={fadeUpDelayed}
                        initial="hidden"
                        animate={controls}
                    >
                        <Link
                            to="/community"
                            className="hidden md:flex items-center gap-4 group text-white hover:text-black bg-white/5 hover:bg-white transition-all duration-500 border border-white/20 hover:border-white px-8 py-4 rounded-full"
                        >
                            <span className="font-bold tracking-wide uppercase text-xs tracking-[0.2em]">Enter Hub</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* 3D Typography Wheel Layout */}
                <motion.div 
                    variants={scaleIn}
                    initial="hidden"
                    animate={controls}
                    className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8 h-[450px] lg:h-[550px] relative"
                >
                    
                    {/* Left: 3D Text Cylinder */}
                    <div 
                        className="w-full lg:w-3/5 h-full relative flex items-center justify-start overflow-hidden lg:overflow-visible mask-vertical-fade z-20"
                        style={{ perspective: '1200px' }}
                    >
                        <div className="relative w-full h-[300px] flex items-center" style={{ transformStyle: 'preserve-3d' }}>
                            {GROUPS.map((group, index) => {
                                // Calculate shortest distance on the wheel for infinite looping
                                let diff = (index - activeIndex) % total;
                                if (diff > Math.floor(total / 2)) diff -= total;
                                if (diff < -Math.floor(total / 2)) diff += total;

                                const isCenter = diff === 0;

                                // The math ensures that when an item wraps from bottom (+2) to top (-2), 
                                // it is completely invisible (opacity 0) so the user doesn't see it fly across the screen.
                                const isVisible = Math.abs(diff) <= 1.5;

                                return (
                                    <motion.div
                                        key={group.id}
                                        animate={{
                                            y: diff * 110, // Vertical spacing reduced to fit screen
                                            rotateX: diff * -35, // Tilt backwards into the screen
                                            z: -Math.abs(diff) * 120, // Push backward in 3D space
                                            scale: 1 - Math.abs(diff) * 0.05,
                                            opacity: isVisible ? (1 - Math.abs(diff) * 0.6) : 0,
                                            zIndex: 50 - Math.abs(diff) // Ensure center item is always on top for clicking
                                        }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className={`absolute w-full flex items-center left-0 ${isVisible ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <div className="flex items-center gap-6">
                                            {isCenter && (
                                                <motion.div 
                                                    layoutId="activeWheelDot"
                                                    className="w-3 h-3 rounded-full bg-alpine-glacier hidden md:block"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <h3 className={`text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-serif font-black tracking-tighter leading-none whitespace-nowrap transition-colors duration-500 ${isCenter ? 'text-white' : 'text-transparent webkit-text-stroke-1'}`}>
                                                {group.name}
                                            </h3>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: The Cinematic Glassmorphic Portal */}
                    <div className="w-full lg:w-2/5 h-[350px] lg:h-full relative flex items-center justify-center pointer-events-none z-10">
                        <div className="w-full max-w-[450px] aspect-[4/5] lg:h-[90%] relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group pointer-events-auto">
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeGroup.id}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    <img 
                                        src={activeGroup.image} 
                                        alt={activeGroup.name}
                                        className="w-full h-full object-cover object-center brightness-75 group-hover:brightness-100 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Portal Content Overlay */}
                            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10 pointer-events-none">
                                <div className="flex justify-between items-start">
                                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                                        <ActiveIcon size={24} className="text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                        <Users size={14} className="text-alpine-glacier" />
                                        <span className="text-xs font-bold text-white tracking-wider">{activeGroup.members} Active</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin size={16} className="text-alpine-glacier" />
                                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-white">{activeGroup.region}</span>
                                    </div>
                                    <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                                        {activeGroup.desc}
                                    </p>
                                    
                                    <Link to="/community" className="pointer-events-auto w-max">
                                        <button className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-alpine-glacier transition-colors group/btn">
                                            Request to Join <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Global style for mask and text-stroke */}
            <style>
                {`
                .mask-vertical-fade {
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                    mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                }
                .webkit-text-stroke-1 {
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
                }
                `}
            </style>
        </section>
    );
};
