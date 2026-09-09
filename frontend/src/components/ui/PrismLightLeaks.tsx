import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

interface PrismLightLeaksProps {
    activeSectionKey: string;
    isBlueSection?: boolean;
}

interface PrismConfig {
    primaryBeam: string;
    secondaryBeam: string;
    causticTint: string;
    accentGlow: string;
}

const PRISM_PALETTES: Record<string, PrismConfig> = {
    hero: {
        primaryBeam: 'from-transparent via-[#38BDF8]/20 via-white/70 via-[#FBBF24]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#A855F7]/15 via-white/60 via-[#34D399]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.12)',
        accentGlow: 'rgba(251, 191, 36, 0.15)'
    },
    mission: {
        primaryBeam: 'from-transparent via-[#FB7185]/20 via-white/70 via-[#FBBF24]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#38BDF8]/15 via-white/60 via-[#F43F5E]/20 to-transparent',
        causticTint: 'rgba(251, 113, 133, 0.14)',
        accentGlow: 'rgba(251, 191, 36, 0.16)'
    },
    stories: {
        primaryBeam: 'from-transparent via-[#38BDF8]/25 via-white/80 via-[#818CF8]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#60A5FA]/20 via-white/60 via-[#C084FC]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.15)',
        accentGlow: 'rgba(129, 140, 248, 0.15)'
    },
    events: {
        primaryBeam: 'from-transparent via-[#34D399]/25 via-white/80 via-[#38BDF8]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#6EE7B7]/20 via-white/60 via-[#A855F7]/15 to-transparent',
        causticTint: 'rgba(52, 211, 153, 0.15)',
        accentGlow: 'rgba(56, 189, 248, 0.15)'
    },
    gallery: {
        primaryBeam: 'from-transparent via-[#00F2FE]/25 via-white/80 via-[#EC4899]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#A855F7]/20 via-white/60 via-[#38BDF8]/20 to-transparent',
        causticTint: 'rgba(0, 242, 254, 0.16)',
        accentGlow: 'rgba(236, 72, 153, 0.15)'
    },
    community: {
        primaryBeam: 'from-transparent via-[#38BDF8]/25 via-white/80 via-[#60A5FA]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#818CF8]/20 via-white/60 via-[#C084FC]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.16)',
        accentGlow: 'rgba(96, 165, 250, 0.15)'
    },
    team: {
        primaryBeam: 'from-transparent via-[#FBBF24]/25 via-white/80 via-[#38BDF8]/20 to-transparent',
        secondaryBeam: 'from-transparent via-[#F43F5E]/15 via-white/60 via-[#FBBF24]/20 to-transparent',
        causticTint: 'rgba(251, 191, 36, 0.15)',
        accentGlow: 'rgba(56, 189, 248, 0.14)'
    },
    reviews: {
        primaryBeam: 'from-transparent via-[#F43F5E]/20 via-white/70 via-[#FBBF24]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#C084FC]/15 via-white/60 via-[#FB7185]/20 to-transparent',
        causticTint: 'rgba(244, 63, 94, 0.14)',
        accentGlow: 'rgba(192, 132, 252, 0.14)'
    },
    merch: {
        primaryBeam: 'from-transparent via-[#FB7185]/25 via-white/80 via-[#FBBF24]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#34D399]/15 via-white/60 via-[#FB7185]/20 to-transparent',
        causticTint: 'rgba(251, 113, 133, 0.15)',
        accentGlow: 'rgba(251, 191, 36, 0.15)'
    },
    contact: {
        primaryBeam: 'from-transparent via-[#38BDF8]/25 via-white/80 via-[#C084FC]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#818CF8]/20 via-white/60 via-[#38BDF8]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.16)',
        accentGlow: 'rgba(192, 132, 252, 0.15)'
    },
    dashboard: {
        primaryBeam: 'from-transparent via-[#38BDF8]/25 via-white/80 via-[#818CF8]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#C084FC]/20 via-white/60 via-[#38BDF8]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.16)',
        accentGlow: 'rgba(129, 140, 248, 0.15)'
    },
    default: {
        primaryBeam: 'from-transparent via-[#38BDF8]/20 via-white/70 via-[#FBBF24]/25 to-transparent',
        secondaryBeam: 'from-transparent via-[#A855F7]/15 via-white/60 via-[#34D399]/20 to-transparent',
        causticTint: 'rgba(56, 189, 248, 0.12)',
        accentGlow: 'rgba(251, 191, 36, 0.15)'
    }
};

export const PrismLightLeaks: React.FC<PrismLightLeaksProps> = React.memo(({ activeSectionKey, isBlueSection }) => {
    const springX = useSpring(0, { stiffness: 35, damping: 25 });
    const springY = useSpring(0, { stiffness: 35, damping: 25 });

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

    const palette = PRISM_PALETTES[activeSectionKey] || (isBlueSection ? PRISM_PALETTES.community : PRISM_PALETTES.default);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            {/* --- PRISM LIGHT BEAM 1 (Diagonal Primary Rift) --- */}
            <motion.div
                animate={{
                    x: ['-10%', '10%', '-10%'],
                    y: ['-5%', '5%', '-5%'],
                    rotate: [-32, -28, -32],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className={`absolute top-[-20%] left-[-20%] w-[150vw] h-[35vh] bg-gradient-to-r ${palette.primaryBeam} blur-[50px] opacity-75 transform-gpu origin-center`}
            />

            {/* --- PRISM LIGHT BEAM 2 (Intersecting Spectral Beam) --- */}
            <motion.div
                animate={{
                    x: ['10%', '-10%', '10%'],
                    y: ['5%', '-10%', '5%'],
                    rotate: [22, 26, 22],
                    scale: [1.05, 0.95, 1.05],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className={`absolute bottom-[10%] right-[-20%] w-[140vw] h-[40vh] bg-gradient-to-r ${palette.secondaryBeam} blur-[55px] opacity-65 transform-gpu origin-center`}
            />

            {/* --- SHIMMERING WATER CAUSTIC POOL 1 --- */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.85, 0.6],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{
                    background: `radial-gradient(circle, ${palette.causticTint} 0%, rgba(255,255,255,0.5) 45%, transparent 75%)`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className="absolute top-[15%] left-[10%] w-[55vw] h-[55vw] rounded-full mix-blend-normal opacity-80 blur-[45px] transform-gpu"
            />

            {/* --- SHIMMERING WATER CAUSTIC POOL 2 --- */}
            <motion.div
                animate={{
                    scale: [1.15, 0.95, 1.15],
                    opacity: [0.5, 0.75, 0.5],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{
                    background: `radial-gradient(circle, ${palette.accentGlow} 0%, rgba(255,255,255,0.4) 50%, transparent 80%)`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className="absolute bottom-[10%] right-[15%] w-[50vw] h-[50vw] rounded-full mix-blend-normal opacity-70 blur-[50px] transform-gpu"
            />

            {/* --- INTERACTIVE CURSOR SUNBEAM LENS FLARE --- */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
                className="absolute top-0 left-0 w-[28vw] h-[28vw] rounded-full bg-gradient-to-r from-white/90 via-[#BAE6FD]/40 to-transparent blur-[65px] opacity-65 mix-blend-normal pointer-events-none transform-gpu"
            />

            {/* Delicate crystalline rainbow shimmer line */}
            <motion.div
                animate={{
                    y: ['0vh', '100vh'],
                    opacity: [0, 0.4, 0]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear'
                }}
                style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
                className="absolute left-[30%] w-[2px] h-[40vh] bg-gradient-to-b from-transparent via-[#00F2FE]/50 via-[#FEE140]/50 to-transparent blur-[2px] transform -rotate-12 opacity-30 transform-gpu"
            />
        </div>
    );
});
