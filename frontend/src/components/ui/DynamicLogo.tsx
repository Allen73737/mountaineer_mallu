import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface DynamicLogoProps {
    className?: string;
    showText?: boolean;
    forceWhiteText?: boolean;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
    className = "h-12",
    showText = false,
    forceWhiteText = false
}) => {
    // Instead of cycling, use the weather to determine the logo (or dark theme)
    // The main site uses dark mode for winter, light for summer.
    const { weather } = useStore();
    const isWinter = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
    const activeLogoSrc = isWinter ? '/logos/winter-logo.png' : '/logos/summer-logo.png';

    return (
        <div className={`relative flex items-center justify-center gap-1 ${className}`}>
            <AnimatePresence mode="wait">
                <div className="relative h-full flex-shrink-0 flex items-center justify-center aspect-square">
                    <AnimatePresence>
                        <motion.div
                            key={activeLogoSrc}
                            initial={{ opacity: 0, filter: 'blur(4px) drop-shadow(0 0 0px rgba(163,201,226,0))' }}
                            animate={{ 
                                opacity: 1, 
                                filter: [
                                    'blur(0px) drop-shadow(0 0 10px rgba(163,201,226,0.3))', 
                                    'blur(0px) drop-shadow(0 0 25px rgba(163,201,226,0.8))', 
                                    'blur(0px) drop-shadow(0 0 10px rgba(163,201,226,0.3))'
                                ]
                            }}
                            exit={{ opacity: 0, filter: 'blur(4px) drop-shadow(0 0 0px rgba(163,201,226,0))', position: 'absolute' }}
                            transition={{ duration: 2, ease: "easeInOut", filter: { repeat: Infinity, duration: 3 } }}
                            className="h-full w-auto absolute inset-0 m-auto flex items-center justify-center z-10"
                        >
                            <img
                                src={activeLogoSrc}
                                alt="Mountaineer Mallu Logomark"
                                className="h-full w-auto object-contain opacity-90 transition-all duration-500 dark:brightness-125 dark:contrast-125"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. Text Logo (Right) */}
                {showText && (
                    <motion.div
                        key="text-logo-container"
                        initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 10, filter: 'blur(5px)' }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="h-[110%] z-0 -ml-2"
                    >
                        <img
                            src="/logos/text-logo.png"
                            alt="Mountaineer Mallu Text"
                            className={`h-full w-auto object-contain transition-all duration-1000 ${
                                forceWhiteText 
                                    ? 'invert opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' 
                                    : 'brightness-0 dark:invert dark:opacity-90 dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                            }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
