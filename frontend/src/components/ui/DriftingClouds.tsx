import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useDeviceOptimization } from '../../lib/deviceOptimization';

interface DriftingCloudsProps {
    activeSectionKey: string;
    isBlueSection?: boolean;
}

interface FogConfig {
    tintColor: string;
    shadowColor: string;
    sunlightColor: string;
}

const FOG_PALETTES: Record<string, FogConfig> = {
    hero: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(254, 243, 199, 0.35)',      // Warm morning sunrise
        shadowColor: 'rgba(186, 230, 253, 0.45)'     // Cool glacier shadow
    },
    mission: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(254, 205, 211, 0.4)',       // Rose gold alpenglow
        shadowColor: 'rgba(203, 213, 225, 0.5)'
    },
    stories: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(186, 230, 253, 0.45)',      // Crisp ice mist
        shadowColor: 'rgba(148, 163, 184, 0.4)'
    },
    events: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(167, 243, 208, 0.35)',      // Fresh mountain mint
        shadowColor: 'rgba(186, 230, 253, 0.45)'
    },
    gallery: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(192, 132, 252, 0.35)',      // Deep alpine violet fog
        shadowColor: 'rgba(56, 189, 248, 0.45)'
    },
    community: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(96, 165, 250, 0.4)',        // Arctic sky blue
        shadowColor: 'rgba(129, 140, 248, 0.45)'
    },
    team: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(253, 230, 138, 0.4)',       // Golden mountain sunlight
        shadowColor: 'rgba(186, 230, 253, 0.4)'
    },
    reviews: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(254, 205, 211, 0.35)',      // Soft sunset cloud
        shadowColor: 'rgba(203, 213, 225, 0.45)'
    },
    merch: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(253, 230, 138, 0.35)',      // Champagne sunrise
        shadowColor: 'rgba(186, 230, 253, 0.45)'
    },
    contact: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(56, 189, 248, 0.4)',        // Glacier mist
        shadowColor: 'rgba(168, 85, 247, 0.35)'
    },
    dashboard: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(224, 242, 254, 0.4)',       // Platinum alpine mist
        shadowColor: 'rgba(192, 132, 252, 0.35)'
    },
    default: {
        sunlightColor: 'rgba(255, 255, 255, 0.95)',
        tintColor: 'rgba(224, 242, 254, 0.4)',
        shadowColor: 'rgba(186, 230, 253, 0.45)'
    }
};

export const DriftingClouds: React.FC<DriftingCloudsProps> = React.memo(({ activeSectionKey, isBlueSection }) => {
    const { isMobile, enableComplexParallax } = useDeviceOptimization();
    const springX = useSpring(0, { stiffness: 45, damping: 22 });
    const springY = useSpring(0, { stiffness: 45, damping: 22 });

    useEffect(() => {
        if (isMobile) return;
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
    }, [isMobile, springX, springY]);

    const config = FOG_PALETTES[activeSectionKey] || (isBlueSection ? FOG_PALETTES.community : FOG_PALETTES.default);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            {/* Drifting Cloud Bank 1 */}
            <motion.div
                animate={{
                    x: ['-15%', '15%', '-15%'],
                    y: ['-5%', '5%', '-5%'],
                    scale: [1, 1.12, 1],
                }}
                transition={{
                    duration: 26,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{
                    background: `linear-gradient(160deg, ${config.sunlightColor} 0%, ${config.tintColor} 45%, ${config.shadowColor} 100%)`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className={`absolute top-[-15%] left-[-15%] w-[85vw] h-[45vh] rounded-full opacity-85 mix-blend-normal transform-gpu origin-center ${isMobile ? 'blur-[30px]' : 'blur-[60px]'}`}
            />

            {/* Drifting Cloud Bank 2 */}
            <motion.div
                animate={{
                    x: ['15%', '-15%', '15%'],
                    y: ['5%', '-8%', '5%'],
                    scale: [1.08, 0.95, 1.08],
                }}
                transition={{
                    duration: 32,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{
                    background: `linear-gradient(340deg, ${config.sunlightColor} 0%, ${config.shadowColor} 50%, ${config.tintColor} 100%)`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className={`absolute bottom-[-10%] right-[-15%] w-[90vw] h-[50vh] rounded-full opacity-80 mix-blend-normal transform-gpu origin-center ${isMobile ? 'blur-[35px]' : 'blur-[70px]'}`}
            />

            {/* Extra cloud layers and mouse interaction only on tablet and desktop */}
            {!isMobile && (
                <>
                    {/* Drifting Cloud Bank 3 */}
                    <motion.div
                        animate={{
                            x: ['-10%', '20%', '-10%'],
                            y: ['10%', '-15%', '10%'],
                            scale: [0.9, 1.15, 0.9],
                        }}
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            background: `radial-gradient(ellipse at center, ${config.sunlightColor} 0%, ${config.tintColor} 40%, ${config.shadowColor} 80%, transparent 100%)`,
                            transform: 'translate3d(0,0,0)',
                            willChange: 'transform'
                        }}
                        className="absolute top-[25%] left-[5%] w-[60vw] h-[55vw] rounded-full blur-[55px] opacity-75 mix-blend-normal transform-gpu"
                    />

                    {/* Drifting Cloud Bank 4 */}
                    <motion.div
                        animate={{
                            x: ['10%', '-10%', '10%'],
                            y: ['-10%', '15%', '-10%'],
                        }}
                        transition={{
                            duration: 28,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            background: `radial-gradient(circle, ${config.sunlightColor} 0%, ${config.shadowColor} 50%, transparent 85%)`,
                            transform: 'translate3d(0,0,0)',
                            willChange: 'transform'
                        }}
                        className="absolute top-[15%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[55px] opacity-70 mix-blend-normal transform-gpu"
                    />

                    {/* Interactive Mouse Cloud Breeze */}
                    {enableComplexParallax && (
                        <motion.div
                            style={{
                                x: springX,
                                y: springY,
                                translateX: '-50%',
                                translateY: '-50%',
                                transform: 'translate3d(0,0,0)',
                                willChange: 'transform'
                            }}
                            className="absolute top-0 left-0 w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-white/90 via-[#E1EEF6]/60 to-transparent blur-[65px] opacity-70 mix-blend-normal pointer-events-none transform-gpu"
                        />
                    )}
                </>
            )}
        </div>
    );
});
