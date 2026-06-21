import React, { useEffect } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const AmbientFrost = () => {
    const { weather } = useStore();
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    
    // Smooth out the velocity so it doesn't snap instantly to 0
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    // Map velocity to blur amount and opacity
    // If you scroll really fast, velocity hits 1000+, frost condenses heavily at the edges
    const blurAmount = useTransform(smoothVelocity, [-2000, 0, 2000], [12, 0, 12]);
    const opacityAmount = useTransform(smoothVelocity, [-2000, 0, 2000], [0.9, 0.3, 0.9]);
    const scaleAmount = useTransform(smoothVelocity, [-2000, 0, 2000], [1, 1.05, 1]);
    const backdropFilter = useTransform(blurAmount, (v: number) => `blur(${v}px)`);

    // Only show in Dark/Winter mode
    const isWinter = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
    if (!isWinter) return null;

    return (
        <motion.div 
            className="fixed inset-0 pointer-events-none z-[9000] mix-blend-screen overflow-hidden"
            style={{ 
                // Creating a vignette mask so only the extreme edges are frosted
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black 100%)',
                maskImage: 'radial-gradient(circle at center, transparent 40%, black 100%)',
                backdropFilter,
                opacity: opacityAmount,
                scale: scaleAmount,
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
        >
            {/* High-fidelity ice frost texture overlay */}
            <div 
                className="absolute inset-[-10%] opacity-40 mix-blend-overlay"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1548232979-6c557ee14752?q=80&w=2000&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'contrast(1.5) brightness(1.2)'
                }}
            />
            {/* Additional noise layer to simulate icy grain */}
            <div 
                className="absolute inset-[-10%] opacity-30"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/dust.png")'
                }}
            />
            
            {/* Dynamic freezing vignette edge glow */}
            <motion.div 
                className="absolute inset-0 shadow-[inset_0_0_150px_rgba(255,255,255,0.4)]"
            />
        </motion.div>
    );
};
