import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useDeviceOptimization } from '../../lib/deviceOptimization';

interface AlpenglowAtmosphereProps {
    activeSectionKey: string;
    isBlueSection?: boolean;
}

interface LightPalette {
    orb1: string;
    orb2: string;
    orb3: string;
}

const LIGHT_PALETTES: Record<string, LightPalette> = {
    hero: { orb1: '#FFD6CC', orb2: '#FFC3A0', orb3: '#E1EEF6' },       // Alpenglow rose & warm sunrise
    mission: { orb1: '#FFC3A0', orb2: '#FFD6CC', orb3: '#FFCCD5' },    // Rose & peach sunrise
    stories: { orb1: '#E1EEF6', orb2: '#C6DDEC', orb3: '#DDD6FE' },    // Morning Frost & Sky Glacier
    events: { orb1: '#CCFBF1', orb2: '#E1EEF6', orb3: '#A7F3D0' },     // Glacier Mint & Luminous Cyan
    team: { orb1: '#E1EEF6', orb2: '#FFD6CC', orb3: '#FFC3A0' },       // Glacier & alpenglow light
    reviews: { orb1: '#FFCCD5', orb2: '#FFC3A0', orb3: '#FFE4E6' },    // Warm Sunset Rose
    merch: { orb1: '#FFD6CC', orb2: '#FFD1BA', orb3: '#FFCCD5' },      // Rose & peach sunburst
    gallery: { orb1: '#7EAACB', orb2: '#9C93B5', orb3: '#C6DDEC' },    // Alpine Cyan & Deep Sea Dew
    contact: { orb1: '#7EAACB', orb2: '#9C93B5', orb3: '#E1EEF6' },    // Glacier Starburst & Violet
    community: { orb1: '#7EAACB', orb2: '#60A5FA', orb3: '#9C93B5' },  // Electric Arctic Blue
    dashboard: { orb1: '#E1EEF6', orb2: '#C4B5FD', orb3: '#C6DDEC' },  // Crisp Glacier Platinum
    default: { orb1: '#FFD6CC', orb2: '#FFC3A0', orb3: '#E1EEF6' }
};

export const AlpenglowAtmosphere: React.FC<AlpenglowAtmosphereProps> = React.memo(({ activeSectionKey, isBlueSection }) => {
    const { isMobile, isTouch, prefersReducedMotion } = useDeviceOptimization();

    // Use spring animation for smooth mouse tracking sunbeam (desktop only)
    const springX = useSpring(0, { stiffness: 40, damping: 20 });
    const springY = useSpring(0, { stiffness: 40, damping: 20 });

    useEffect(() => {
        if (isMobile || isTouch) return;
        let frameId: number;
        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                springX.set(e.clientX);
                springY.set(e.clientY);
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, [springX, springY, isMobile, isTouch]);

    const palette = LIGHT_PALETTES[activeSectionKey] || (isBlueSection ? LIGHT_PALETTES.community : LIGHT_PALETTES.default);

    const blur1 = isMobile ? 'blur-[40px]' : 'blur-[90px]';
    const blur2 = isMobile ? 'blur-[45px]' : 'blur-[100px]';
    const blur3 = isMobile ? 'blur-[40px]' : 'blur-[90px]';

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            {/* Luminous Alpine Silk Orbs */}
            <motion.div
                animate={prefersReducedMotion ? { backgroundColor: palette.orb1 } : {
                    backgroundColor: palette.orb1,
                    x: ['-5%', '15%', '-5%'],
                    y: ['-10%', '10%', '-10%'],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    backgroundColor: { duration: 1.5, ease: 'easeInOut' },
                    x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className={`absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full ${blur1} opacity-60 mix-blend-multiply transform-gpu`}
            />

            <motion.div
                animate={prefersReducedMotion ? { backgroundColor: palette.orb2 } : {
                    backgroundColor: palette.orb2,
                    x: ['10%', '-15%', '10%'],
                    y: ['15%', '-10%', '15%'],
                    scale: [1.1, 0.95, 1.1],
                }}
                transition={{
                    backgroundColor: { duration: 1.5, ease: 'easeInOut' },
                    x: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 22, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full ${blur2} opacity-50 mix-blend-multiply transform-gpu`}
            />

            <motion.div
                animate={prefersReducedMotion ? { backgroundColor: palette.orb3 } : {
                    backgroundColor: palette.orb3,
                    x: ['0%', '10%', '-10%', '0%'],
                    y: ['0%', '-15%', '10%', '0%'],
                }}
                transition={{
                    backgroundColor: { duration: 1.5, ease: 'easeInOut' },
                    x: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 25, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className={`absolute top-[25%] left-[25%] w-[50vw] h-[50vw] rounded-full ${blur3} opacity-45 mix-blend-normal transform-gpu`}
            />

            {/* Interactive Mouse Sunbeam Bloom (Desktop Only) */}
            {!isMobile && !isTouch && (
                <motion.div
                    style={{
                        x: springX,
                        y: springY,
                        translateX: '-50%',
                        translateY: '-50%',
                        transform: 'translate3d(0,0,0)',
                        willChange: 'transform'
                    }}
                    className="absolute top-0 left-0 w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-[#FFF5F2]/80 via-[#FFE1D6]/60 to-transparent blur-[80px] opacity-70 mix-blend-normal pointer-events-none transform-gpu"
                />
            )}

            {/* Swiss Geometric Technical Grid Texture */}
            <div 
                className="absolute inset-0 opacity-[0.035] pointer-events-none" 
                style={{
                    backgroundImage: 'linear-gradient(#0B0C10 1px, transparent 1px), linear-gradient(90deg, #0B0C10 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />
        </div>
    );
});
