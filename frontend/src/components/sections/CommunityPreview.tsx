import React, { useRef } from 'react';
import { motion, useInView, useAnimationFrame, useMotionValue, useTransform, wrap } from 'framer-motion';
import { Users, MapPin, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GROUPS = [
    { id: 1, name: 'Alpine Vanguards', region: 'Chamonix, FR', members: 128, desc: 'Technical ascents and mixed climbing focus. High altitude experience required.', icon: ShieldCheck },
    { id: 2, name: 'Bavarian Trekkers', region: 'Munich, DE', members: 450, desc: 'Weekend hiking operations across the Zugspitze region. All levels welcome.', icon: Compass },
    { id: 3, name: 'Dolomites Scramblers', region: 'Cortina, IT', members: 85, desc: 'Via Ferrata, ridge traverses, and light mountaineering.', icon: ShieldCheck },
    { id: 4, name: 'Swiss High Route', region: 'Zermatt, CH', members: 210, desc: 'Multi-day hut-to-hut glacier expeditions and logistics planning.', icon: Compass }
];

export const CommunityPreview = () => {
    const { t } = useTranslation();
    const baseX = useMotionValue(0);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: false, margin: "-100px" });

    const scrollItems = [...GROUPS, ...GROUPS, ...GROUPS];
    const baseVelocity = -0.03; // Slightly slower than events for reading text

    useAnimationFrame((t: any, delta: any) => {
        let moveBy = baseVelocity * (delta / 16);
        baseX.set(baseX.get() + moveBy);
    });

    const x = useTransform(baseX, (v: any) => `${wrap(-33.33, 0, v)}%`);

    // Mobile carousel state
    const [mobileIndex, setMobileIndex] = React.useState(0);
    const mobileCarouselRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (mobileCarouselRef.current) {
                const nextIndex = (mobileIndex + 1) % GROUPS.length;
                setMobileIndex(nextIndex);
                mobileCarouselRef.current.scrollTo({
                    left: mobileCarouselRef.current.clientWidth * nextIndex,
                    behavior: 'smooth'
                });
            }
        }, 4000); // Pause for 4 seconds before turning
        return () => clearInterval(interval);
    }, [mobileIndex]);

    return (
        <section ref={containerRef} id="community" className="py-20 md:py-28 px-6 md:px-12 relative z-10 bg-alpine-snow dark:bg-black border-t border-black/5 dark:border-white/5 overflow-hidden">
            {/* Ambient Background Orbs for Glassmorphism */}
            <div className="absolute top-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-[0.12] dark:opacity-[0.1] pointer-events-none blur-[100px]" style={{ background: '#E2A071' }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.12] dark:opacity-[0.1] pointer-events-none blur-[100px]" style={{ background: '#A3C9E2' }} />
            <div className="absolute top-[40%] left-[30%] w-[25vw] h-[25vw] rounded-full opacity-[0.08] dark:opacity-[0.06] pointer-events-none blur-[80px]" style={{ background: '#4A6A8C' }} />

            <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.6 }}
                            className="text-alpine-forest dark:text-alpine-glacier text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                        >
                            {t('community.join_brotherhood', 'Join the Ranks')}
                        </motion.p>
                        <motion.h2
                            initial={{ y: 30, opacity: 0 }}
                            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                            transition={{ duration: 0.8, type: "spring", damping: 20 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif mb-3 md:mb-4 text-alpine-navy dark:text-alpine-snow"
                        >
                            {t('community.title', 'Community')}
                        </motion.h2>
                        <motion.p
                            initial={{ x: -30, opacity: 0 }}
                            animate={isInView ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-alpine-navy/60 dark:text-alpine-snow/60 max-w-xl font-light text-base md:text-xl"
                        >
                            {t('community.subtitle', 'Join specialized factions. Coordinate expeditions, share intelligence, and find your ropemates.')}
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
                    >
                        <Link
                            to="/community"
                            className="hidden md:flex items-center gap-2 group text-alpine-forest dark:text-alpine-glacier transition-colors"
                        >
                            <span className="font-medium tracking-wide">{t('community.access_comms', 'Enter Hub')}</span>
                            <div className="bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-full group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Desktop Continuous Marquee Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1, type: "spring", damping: 15, delay: 0.2 }}
                    className="w-full relative overflow-hidden py-4 md:py-6 hidden md:block"
                >
                    <motion.div
                        className="flex gap-4 md:gap-6 w-max"
                        style={{ x }}
                        drag="x"
                        dragConstraints={{ left: -1000, right: 1000 }}
                        dragElastic={0.1}
                        onDrag={(e: any, info: any) => {
                            const velocityOverride = info.delta.x * 2;
                            baseX.set(baseX.get() + velocityOverride);
                        }}
                    >
                        {scrollItems.map((group, i) => {
                            const Icon = group.icon;
                            return (
                                <div
                                    key={`${group.id}-${i}`}
                                    className="relative min-w-[300px] md:min-w-[420px] pb-4 flex-shrink-0 group cursor-grab active:cursor-grabbing"
                                >
                                    <div className="h-full premium-card-light dark:premium-card rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-black/5 dark:border-white/[0.06] hover:border-alpine-glacier/30 dark:hover:border-white/15 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                                        <div>
                                            <div className="flex justify-between items-start mb-5 md:mb-6">
                                                <div className="bg-alpine-navy dark:bg-white/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl shrink-0">
                                                    <Icon size={24} className="text-white" />
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full shrink-0">
                                                    <Users size={13} className="text-alpine-navy/60 dark:text-alpine-snow/60" />
                                                    <span className="text-xs font-bold text-alpine-navy/80 dark:text-alpine-snow/80">{group.members}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-serif text-xl md:text-2xl font-bold text-alpine-navy dark:text-white mb-2 leading-tight">{group.name}</h3>
                                            <div className="flex items-center gap-1.5 text-alpine-forest dark:text-alpine-glacier mb-3 md:mb-4">
                                                <MapPin size={14} />
                                                <span className="text-xs md:text-sm font-semibold tracking-wide uppercase">{group.region}</span>
                                            </div>
                                            <p className="text-alpine-navy/70 dark:text-white/60 text-sm md:text-base leading-relaxed mb-6 md:mb-8 whitespace-normal">
                                                {group.desc}
                                            </p>
                                        </div>
        
                                        <Link to="/community" className="w-full mt-auto">
                                            <button className="w-full py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-alpine-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 font-semibold tracking-wide text-sm md:text-base flex items-center justify-center gap-2 group-hover:shadow-lg btn-premium">
                                                {t('community.join_now', 'Request to Join')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </motion.div>

                {/* Mobile Snap Carousel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1, type: "spring", damping: 15, delay: 0.2 }}
                    className="w-full md:hidden"
                >
                    <div 
                        ref={mobileCarouselRef}
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4"
                        onScroll={(e) => {
                            const target = e.target as HTMLDivElement;
                            const newIndex = Math.round(target.scrollLeft / target.clientWidth);
                            if (newIndex !== mobileIndex) setMobileIndex(newIndex);
                        }}
                    >
                        {GROUPS.map((group) => {
                            const Icon = group.icon;
                            return (
                                <div key={group.id} className="w-[85vw] shrink-0 snap-center pb-2">
                                    <div className="h-full premium-card-light dark:premium-card rounded-3xl p-6 flex flex-col justify-between border border-black/5 dark:border-white/[0.06] shadow-xl">
                                        <div>
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="bg-alpine-navy dark:bg-white/10 p-2.5 rounded-2xl shrink-0">
                                                    <Icon size={24} className="text-white" />
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full shrink-0">
                                                    <Users size={13} className="text-alpine-navy/60 dark:text-white/60" />
                                                    <span className="text-xs font-bold text-alpine-navy/80 dark:text-white/80">{group.members}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-serif text-xl font-bold text-alpine-navy dark:text-white mb-2 leading-tight">{group.name}</h3>
                                            <div className="flex items-center gap-1.5 text-alpine-forest dark:text-alpine-glacier mb-3">
                                                <MapPin size={14} />
                                                <span className="text-xs font-semibold tracking-wide uppercase">{group.region}</span>
                                            </div>
                                            <p className="text-alpine-navy/70 dark:text-white/60 text-sm leading-relaxed mb-6 whitespace-normal min-h-[4rem]">
                                                {group.desc}
                                            </p>
                                        </div>
        
                                        <Link to="/community" className="w-full mt-auto">
                                            <button className="w-full py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-alpine-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 font-semibold tracking-wide text-sm flex items-center justify-center gap-2 group-hover:shadow-lg btn-premium">
                                                {t('community.join_now', 'Request to Join')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-2 mt-2">
                        {GROUPS.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === mobileIndex ? 'w-6 bg-alpine-glacier' : 'w-1.5 bg-black/20 dark:bg-white/20'}`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Mobile View All */}
                <div className="flex justify-center md:hidden">
                    <Link
                        to="/community"
                        className="flex items-center gap-2 text-base group text-alpine-forest dark:text-alpine-glacier font-medium"
                    >
                        {t('community.access_comms', 'Enter Community Hub')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
