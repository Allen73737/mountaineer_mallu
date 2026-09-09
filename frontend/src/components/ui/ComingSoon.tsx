import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { HardHat, Wrench, Clock } from 'lucide-react';

interface ComingSoonProps {
    sectionName: string;
    sectionId?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ sectionName, sectionId }) => {
    // Mouse Parallax Logic
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        const x = (clientX / window.innerWidth) * 2 - 1;
        const y = (clientY / window.innerHeight) * 2 - 1;
        setMousePosition({ x, y });
    };

    const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 });
    const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 });

    useEffect(() => {
        springX.set(mousePosition.x);
        springY.set(mousePosition.y);
    }, [mousePosition, springX, springY]);

    const titleX = useTransform(springX, [-1, 1], [-30, 30]);
    const titleY = useTransform(springY, [-1, 1], [-30, 30]);
    const lightX = useTransform(springX, [-1, 1], ['0%', '100%']);
    const lightY = useTransform(springY, [-1, 1], ['0%', '100%']);

    return (
        <section 
            id={sectionId} 
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-transparent transition-colors duration-700 cursor-default"
        >
            {/* Dynamic Spotlight */}
            <motion.div 
                className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-30 pointer-events-none mix-blend-screen"
                style={{
                    left: lightX,
                    top: lightY,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(255,255,255,0) 70%)'
                }}
            />

            {/* Ultra Premium Crystal Horizon Light Beams */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/30 to-transparent pointer-events-none shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/[0.05] dark:from-amber-500/[0.08] to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/30 to-transparent pointer-events-none shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-amber-500/[0.05] dark:from-amber-500/[0.08] to-transparent pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center p-6 md:p-12">
                
                {/* Tactical Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex items-center gap-4 mb-10 bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                >
                    <Wrench className="text-amber-600 dark:text-amber-500 animate-pulse" size={16} />
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-600 dark:text-amber-500">
                        In Active Development
                    </span>
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                </motion.div>

                {/* Massive Typography */}
                <motion.h2
                    style={{ x: titleX, y: titleY }}
                    className="text-center w-full relative max-w-[1400px] mx-auto flex flex-col items-center gap-2"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="block text-[8vw] md:text-[6vw] lg:text-[5rem] font-serif font-black tracking-tighter leading-[1] text-alpine-navy/60 dark:text-white/50"
                    >
                        {sectionName}
                    </motion.span>
                    
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="block text-[15vw] md:text-[12vw] lg:text-[10rem] font-serif font-black tracking-tighter leading-[0.8] text-alpine-navy dark:text-white drop-shadow-[0_0_40px_rgba(74,106,140,0.15)] dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        COMING SOON
                    </motion.span>
                </motion.h2>

                {/* Minimalist Subtext */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-16 md:mt-24 flex flex-col items-center gap-8"
                >
                    <div className="flex items-center gap-3 text-alpine-navy/60 dark:text-white/50 text-sm md:text-base font-light tracking-[0.2em] max-w-md text-center uppercase">
                        <Clock size={16} className="text-alpine-navy/40 dark:text-white/30" />
                        Our team is preparing this zone
                    </div>
                    
                    {/* Abstract line divider */}
                    <div className="w-[1px] h-24 bg-gradient-to-b from-amber-500/50 to-transparent" />
                </motion.div>
                
            </div>
        </section>
    );
};
