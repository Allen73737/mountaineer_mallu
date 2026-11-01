import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLenis } from './SmoothScrollProvider';

interface SectionItem {
    id: string;
    label: string;
    num: string;
}

const SECTIONS: SectionItem[] = [
    { id: 'hero', label: 'Summit HQ', num: '01' },
    { id: 'mission', label: 'Mission', num: '02' },
    { id: 'stories', label: 'Stories', num: '03' },
    { id: 'community', label: 'Community', num: '04' },
    { id: 'events', label: 'Expeditions', num: '05' },
    { id: 'gallery', label: 'Gallery', num: '06' },
    { id: 'team', label: 'Pillars', num: '07' },
    { id: 'reviews', label: 'Reviews', num: '08' },
    { id: 'shop', label: 'Gear Shop', num: '09' },
    { id: 'contact', label: 'Base Contact', num: '10' },
];

export const SectionNavTracker: React.FC = () => {
    const { lenis } = useLenis();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [isHovered, setIsHovered] = useState<boolean>(false);

    // Hide on admin routes or auth pages
    if (
        location.pathname.startsWith('/summit-control-panel') ||
        location.pathname.startsWith('/portal') ||
        ['/login', '/signup', '/profile-complete'].includes(location.pathname)
    ) {
        return null;
    }

    useEffect(() => {
        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '-30% 0px -40% 0px',
            threshold: 0.1,
        });

        SECTIONS.forEach((sec) => {
            const el = document.getElementById(sec.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [location.pathname]);

    const scrollToSection = (id: string) => {
        if (lenis) {
            lenis.scrollTo(`#${id}`, { offset: -60 });
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const activeItem = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-start pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="glass-premium px-3 py-4 rounded-full border border-white/15 backdrop-blur-2xl flex flex-col items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-alpine-glacier/50 hover:px-4">
                {/* Active Section Telemetry Label */}
                <div className="flex items-center gap-2 px-1 text-[10px] font-mono font-bold tracking-widest text-alpine-sunrise uppercase">
                    <span>{activeItem.num}</span>
                    <AnimatePresence mode="wait">
                        {isHovered && (
                            <motion.span
                                key={activeItem.id}
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap text-white/90 font-sans truncate"
                            >
                                {activeItem.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Section Navigation Dots */}
                <div className="flex flex-col items-center gap-2.5 my-1">
                    {SECTIONS.map((sec) => {
                        const isActive = sec.id === activeSection;
                        return (
                            <button
                                key={sec.id}
                                onClick={() => scrollToSection(sec.id)}
                                className="group relative flex items-center justify-center p-1 rounded-full focus:outline-none"
                                title={`${sec.num} // ${sec.label}`}
                            >
                                {/* Dot Indicator */}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.4 : 1,
                                        backgroundColor: isActive ? '#7EAACB' : 'rgba(255, 255, 255, 0.3)',
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-2 h-2 rounded-full transition-[color,background-color,border-color,box-shadow] ${
                                        isActive
                                            ? 'shadow-[0_0_12px_rgba(56,189,248,0.9)]'
                                            : 'group-hover:bg-white group-hover:scale-125'
                                    }`}
                                />

                                {/* Tooltip on Hover */}
                                {isHovered && !isActive && (
                                    <span className="absolute left-6 text-[9px] font-mono font-semibold tracking-wider text-white/70 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {sec.num} {sec.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
