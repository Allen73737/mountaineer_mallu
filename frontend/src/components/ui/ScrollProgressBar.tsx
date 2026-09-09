import React from 'react';
import { motion, useSpring, useTransform, useScroll } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
    const { scrollYProgress } = useScroll();

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 25,
        restDelta: 0.0001,
    });

    const scaleX = smoothProgress;
    const opacity = useTransform(smoothProgress, [0, 0.01], [0, 1]);

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-1.5 overflow-hidden">
            <div className="w-full h-full bg-white/10 dark:bg-black/20 backdrop-blur-sm" />
            <motion.div
                className="absolute inset-0 origin-left h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-300 dark:from-cyan-400 dark:via-indigo-400 dark:to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                style={{
                    scaleX,
                    opacity,
                }}
            />
        </div>
    );
};
