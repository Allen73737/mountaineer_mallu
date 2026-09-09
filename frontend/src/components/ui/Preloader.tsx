import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Preloader = () => {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            return !sessionStorage.getItem('hasSeenPreloader');
        }
        return true;
    });
    const [elevation, setElevation] = useState(0);

    useEffect(() => {
        // Only show once per session
        const hasSeen = sessionStorage.getItem('hasSeenPreloader');
        if (hasSeen) {
            return;
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        // Animate elevation to 8848m
        const target = 8848;
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const stepTime = duration / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Ease out expo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            setElevation(Math.round(easeProgress * target));

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(() => {
                    // Play a subtle click sound
                    try {
                        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_b8c9103636.mp3?filename=click-button-140881.mp3');
                        audio.volume = 0.2;
                        audio.play().catch(() => {}); // Catch if browser blocks autoplay
                    } catch (e) {}

                    setIsVisible(false);
                    sessionStorage.setItem('hasSeenPreloader', 'true');
                    document.body.style.overflow = 'auto';
                }, 400); // Hold at 8848 for a moment
            }
        }, stepTime);

        return () => {
            clearInterval(timer);
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        {/* Altimeter Dial Ring */}
                        <div className="relative w-48 h-48 rounded-full border-2 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                            {/* Inner spinning ring */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                className="absolute inset-2 rounded-full border border-dashed border-white/20"
                            />
                            
                            {/* Altitude Reading */}
                            <div className="text-center z-10 flex flex-col items-center">
                                <span className="text-sm font-semibold tracking-[0.3em] text-white/50 uppercase mb-2">Altitude</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-mono font-black tracking-tighter">{elevation}</span>
                                    <span className="text-xl font-bold text-alpine-glacier">m</span>
                                </div>
                            </div>
                        </div>

                        <motion.div 
                            className="mt-12 h-[1px] w-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{ width: "200px" }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <p className="mt-4 text-xs tracking-[0.5em] text-white/30 uppercase">Calibrating</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
