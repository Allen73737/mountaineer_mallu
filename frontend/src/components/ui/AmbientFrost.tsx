import React from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const AmbientFrost = React.memo(() => {
    const { weather } = useStore();
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    
    // Smooth out velocity tracking
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    const opacityAmount = useTransform(smoothVelocity, [-2000, 0, 2000], [0.85, 0.2, 0.85]);
    const scaleAmount = useTransform(smoothVelocity, [-2000, 0, 2000], [1, 1.05, 1]);

    // Only show in Dark/Winter mode
    const isWinter = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
    if (!isWinter) return null;

    return (
        <motion.div 
            className="fixed inset-0 pointer-events-none z-[9000] mix-blend-screen overflow-hidden transform-gpu"
            style={{ 
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black 100%)',
                maskImage: 'radial-gradient(circle at center, transparent 40%, black 100%)',
                opacity: opacityAmount,
                scale: scaleAmount,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                transform: 'translate3d(0,0,0)',
                willChange: 'transform, opacity'
            }}
        >
            {/* Ultra-lightweight icy gradient noise */}
            <div 
                className="absolute inset-[-10%] opacity-40 mix-blend-overlay transform-gpu"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(186,230,253,0.2) 50%, transparent 100%)`,
                    filter: 'contrast(1.3) brightness(1.1)'
                }}
            />
            
            {/* Dynamic freezing vignette edge glow */}
            <div 
                className="absolute inset-0 shadow-[inset_0_0_120px_rgba(255,255,255,0.35)] transform-gpu"
            />
        </motion.div>
    );
});
