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
    return (
        <div className={`relative flex items-center justify-center gap-1 ${className}`}>
            <div className="relative h-full flex-shrink-0 flex items-center justify-center aspect-square min-w-[32px] min-h-[32px]">
                <div className="h-full w-full flex items-center justify-center z-10 aspect-square">
                    <img
                        src="/logos/logo-dark.png"
                        alt="Mountaineer Mallu Logomark Dark"
                        width={48}
                        height={48}
                        className="hidden dark:block h-full w-full object-contain brightness-125 contrast-125 drop-shadow-[0_0_12px_rgba(163,201,226,0.4)] aspect-square"
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                    />
                    <img
                        src="/logos/logo-light.png"
                        alt="Mountaineer Mallu Logomark Light"
                        width={48}
                        height={48}
                        className="block dark:hidden h-full w-full object-contain drop-shadow-[0_0_12px_rgba(163,201,226,0.4)] aspect-square"
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                    />
                </div>
            </div>

            {/* 2. Text Logo (Right) — Instant Native HTML Paint */}
            {showText && (
                <div className="h-[110%] z-0 -ml-2 flex items-center aspect-[140/48] flex-shrink-0">
                    <img
                        src="/logos/text-logo.png"
                        alt="Mountaineer Mallu Text"
                        width={140}
                        height={48}
                        className={`h-full w-full object-contain aspect-[140/48] ${
                            forceWhiteText 
                                ? 'invert drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' 
                                : 'brightness-0 dark:invert dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                        }`}
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                    />
                </div>
            )}
        </div>
    );
};
