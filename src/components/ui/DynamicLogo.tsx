import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface DynamicLogoProps {
    className?: string;
    showText?: boolean;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
    className = "h-12",
    showText = false
}) => {
    const { weather } = useStore();

    const isWinter = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
    const activeLogoSrc = isWinter ? '/logos/winter-logo.png' : '/logos/summer-logo.png';

    return (
        <div className={`relative flex items-center justify-center gap-1 ${className}`}>
            <AnimatePresence mode="wait">
                {/* 1. Image Logo (Left) */}
                <motion.img
                    key={activeLogoSrc}
                    src={activeLogoSrc}
                    alt="Mountaineer Mallu Logomark"
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(5px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full w-auto object-contain drop-shadow-lg z-10"
                />

                {/* 2. Text Logo (Right) */}
                {showText && (
                    <motion.img
                        key={`text-${activeLogoSrc}`}
                        src="/logos/text-logo.png"
                        alt="Mountaineer Mallu Text"
                        initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 10, filter: 'blur(5px)' }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        // Scaled text up relatively, removed extreme negative margin to let flex gap control spacing
                        className={`h-[110%] w-auto object-contain z-0 -ml-2 transition-all duration-1000 ${isWinter ? 'brightness-[1.8] contrast-125 saturate-0' : 'brightness-50 contrast-125'}`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
