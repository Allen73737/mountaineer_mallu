import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

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
    hero: { orb1: '#FFE5B4', orb2: '#FFC3A0', orb3: '#E0F2FE' },       // Champagne & Warm Sunrise Gold
    mission: { orb1: '#FFC3A0', orb2: '#FFE5B4', orb3: '#FFCCD5' },    // Rose Gold & Peach Sunrise
    stories: { orb1: '#E0F2FE', orb2: '#BAE6FD', orb3: '#DDD6FE' },    // Morning Frost & Sky Glacier
    events: { orb1: '#CCFBF1', orb2: '#E0F2FE', orb3: '#A7F3D0' },     // Glacier Mint & Luminous Cyan
    team: { orb1: '#FEF3C7', orb2: '#FDE68A', orb3: '#FFC3A0' },       // Golden Mountain Light
    reviews: { orb1: '#FFCCD5', orb2: '#FFC3A0', orb3: '#FFE4E6' },    // Warm Sunset Rose
    merch: { orb1: '#FFE5B4', orb2: '#FFD1BA', orb3: '#FFCCD5' },      // Champagne & Peach Sunburst
    gallery: { orb1: '#38BDF8', orb2: '#818CF8', orb3: '#BAE6FD' },    // Alpine Cyan & Deep Sea Dew
    contact: { orb1: '#38BDF8', orb2: '#C084FC', orb3: '#E0F2FE' },    // Glacier Starburst & Violet
    community: { orb1: '#38BDF8', orb2: '#60A5FA', orb3: '#818CF8' },  // Electric Arctic Blue
    dashboard: { orb1: '#E0F2FE', orb2: '#C4B5FD', orb3: '#BAE6FD' },  // Crisp Glacier Platinum
    default: { orb1: '#FFE5B4', orb2: '#FFC3A0', orb3: '#E0F2FE' }
};

export const AlpenglowAtmosphere: React.FC<AlpenglowAtmosphereProps> = React.memo(({ activeSectionKey, isBlueSection }) => {
    // Use spring animation for smooth mouse tracking sunbeam
    const springX = useSpring(0, { stiffness: 40, damping: 20 });
    const springY = useSpring(0, { stiffness: 40, damping: 20 });

    useEffect(() => {
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
    }, [springX, springY]);

    const palette = LIGHT_PALETTES[activeSectionKey] || (isBlueSection ? LIGHT_PALETTES.community : LIGHT_PALETTES.default);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            {/* Luminous Alpine Silk Orbs */}
            <motion.div
                animate={{
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
                className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full blur-[90px] opacity-60 mix-blend-multiply transform-gpu"
            />

            <motion.div
                animate={{
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
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-50 mix-blend-multiply transform-gpu"
            />

            <motion.div
                animate={{
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
                className="absolute top-[25%] left-[25%] w-[50vw] h-[50vw] rounded-full blur-[90px] opacity-45 mix-blend-normal transform-gpu"
            />

            {/* Interactive Mouse Sunbeam Bloom */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className="absolute top-0 left-0 w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-[#FFFBEB]/80 via-[#FEF3C7]/60 to-transparent blur-[80px] opacity-70 mix-blend-normal pointer-events-none transform-gpu"
            />

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
