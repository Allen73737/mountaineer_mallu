import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

type CursorState = 'default' | 'button' | 'gallery' | 'text' | 'hero' | 'hidden';

export const CustomCursor = () => {
    const [cursorState, setCursorState] = useState<CursorState>('default');
    const [isVisible, setIsVisible] = useState(false);

    // Mouse coordinates
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Main Dot physics (very snappy)
    const dotX = useSpring(mouseX, { damping: 40, stiffness: 600, mass: 0.1 });
    const dotY = useSpring(mouseY, { damping: 40, stiffness: 600, mass: 0.1 });

    // Trail physics (Ice/Frost trailing effect)
    const trailSprings = Array.from({ length: 8 }, (_, i) => ({
        x: useSpring(mouseX, { damping: 20 + i * 5, stiffness: 400 - i * 30, mass: 0.1 + i * 0.1 }),
        y: useSpring(mouseY, { damping: 20 + i * 5, stiffness: 400 - i * 30, mass: 0.1 + i * 0.1 })
    }));

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            if (target.closest('.gallery-item')) {
                setCursorState('gallery');
                return;
            }

            if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.closest('[contenteditable="true"]')) {
                setCursorState('text');
                return;
            }

            if (target.closest('.hero-section-cursor')) {
                setCursorState('hero');
                return;
            }

            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                target.closest('.cursor-pointer') ||
                target.closest('.swiper-button-next') ||
                target.closest('.swiper-button-prev')
            ) {
                setCursorState('button');
                return;
            }

            setCursorState('default');
        };

        window.addEventListener('mousemove', updateMousePosition, { passive: true });
        window.addEventListener('mouseout', handleMouseLeave);
        window.addEventListener('mouseover', handleMouseEnter);
        window.addEventListener('mouseover', handleHover, { passive: true });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseout', handleMouseLeave);
            window.removeEventListener('mouseover', handleMouseEnter);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [mouseX, mouseY, isVisible]);

    // Disable on touch devices
    if (typeof window === 'undefined' || window.innerWidth < 768) {
        return null; 
    }

    const dotVariants = {
        default: { width: 24, height: 24, backgroundColor: 'rgba(255, 255, 255, 1)', x: "-50%", y: "-50%", opacity: 1 },
        button: { width: 80, height: 80, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.8)', x: "-50%", y: "-50%", opacity: 1 },
        gallery: { width: 120, height: 120, backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', x: "-50%", y: "-50%", opacity: 1 },
        text: { width: 4, height: 48, backgroundColor: 'white', x: "-50%", y: "-50%", opacity: 1 },
        hero: { width: 200, height: 200, backgroundColor: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(4px)', border: '0.5px solid rgba(255,255,255,0.5)', x: "-50%", y: "-50%", opacity: 1 },
        hidden: { width: 0, height: 0, opacity: 0 }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] mix-blend-difference overflow-hidden">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Ice/Frost Liquid Trail Segments */}
                        {trailSprings.map((spring, i) => (
                            <motion.div
                                key={i}
                                className="absolute top-0 left-0 rounded-full bg-blue-200 will-change-transform mix-blend-screen"
                                style={{ 
                                    x: spring.x, 
                                    y: spring.y, 
                                    translateX: "-50%", 
                                    translateY: "-50%",
                                    width: 18 - i * 1.5,
                                    height: 18 - i * 1.5,
                                    opacity: cursorState === 'default' ? 0.8 - (i * 0.1) : 0,
                                    boxShadow: `0 0 ${8 + i}px rgba(160, 200, 255, ${0.8 - i*0.1})`
                                }}
                            />
                        ))}

                        {/* Main Dot */}
                        <motion.div
                            className="absolute top-0 left-0 rounded-full flex items-center justify-center will-change-transform drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                            style={{ x: dotX, y: dotY }}
                            variants={dotVariants}
                            animate={cursorState}
                            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.1 }}
                        >
                            <AnimatePresence mode="wait">
                                {cursorState === 'gallery' && (
                                    <motion.span 
                                        key="gallery-text"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="text-white font-serif font-black text-xs tracking-[0.3em] uppercase mix-blend-normal"
                                    >
                                        Explore
                                    </motion.span>
                                )}
                                {cursorState === 'hero' && (
                                    <motion.div 
                                        key="hero-text"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-normal"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
