import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useDeviceOptimization } from '../../lib/deviceOptimization';

type CursorState = 'default' | 'button' | 'gallery' | 'text' | 'hero' | 'hidden';

export const CustomCursor = () => {
    const { enableCustomCursor } = useDeviceOptimization();

    if (!enableCustomCursor) return null;

    return <ActiveCustomCursor />;
};

const ActiveCustomCursor = () => {
    const [cursorState, setCursorState] = useState<CursorState>('default');
    const [isVisible, setIsVisible] = useState(false);
    const lastTargetRef = useRef<EventTarget | null>(null);

    // Direct mouse coordinates
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Optimized snappy spring
    const dotX = useSpring(mouseX, { damping: 32, stiffness: 450, mass: 0.1 });
    const dotY = useSpring(mouseY, { damping: 32, stiffness: 450, mass: 0.1 });

    useEffect(() => {
        // Disable on touch devices
        if (typeof window === 'undefined' || window.innerWidth < 768) return;

        let scheduled = false;
        let lastEvent: MouseEvent | null = null;

        const updatePosition = () => {
            if (lastEvent) {
                mouseX.set(lastEvent.clientX);
                mouseY.set(lastEvent.clientY);
            }
            scheduled = false;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (document.body.classList.contains('is-scrolling')) return;
            lastEvent = e;
            if (!isVisible) setIsVisible(true);
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(updatePosition);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target || target === lastTargetRef.current) return;
            lastTargetRef.current = target;

            const tagName = target.tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                setCursorState('text');
                return;
            }
            if (tagName === 'A' || tagName === 'BUTTON') {
                setCursorState('button');
                return;
            }

            const closestInteractive = target.closest(
                'a, button, [role="button"], .cursor-pointer, .gallery-item, .hero-section-cursor, [contenteditable="true"]'
            );
            if (closestInteractive) {
                if (closestInteractive.classList.contains('gallery-item')) {
                    setCursorState('gallery');
                    return;
                }
                if (closestInteractive.classList.contains('hero-section-cursor')) {
                    setCursorState('hero');
                    return;
                }
                if (closestInteractive.getAttribute('contenteditable') === 'true') {
                    setCursorState('text');
                    return;
                }
                setCursorState('button');
                return;
            }

            setCursorState('default');
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseout', handleMouseLeave, { passive: true });
        window.addEventListener('mouseover', (e) => {
            handleMouseEnter();
            handleHover(e);
        }, { passive: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, [mouseX, mouseY, isVisible]);

    // Don't render on touch or during active scroll for 100% smooth scroll frame rate
    if (typeof window === 'undefined' || window.innerWidth < 768) {
        return null;
    }

    const dotVariants = {
        default: { width: 24, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(0, 0, 0, 0.15)', x: "-50%", y: "-50%", opacity: 1 },
        button: { width: 68, height: 68, backgroundColor: 'rgba(56, 189, 248, 0.18)', border: '1.5px solid rgba(56, 189, 248, 0.8)', x: "-50%", y: "-50%", opacity: 1 },
        gallery: { width: 96, height: 96, backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1.5px solid rgba(255, 255, 255, 0.9)', x: "-50%", y: "-50%", opacity: 1 },
        text: { width: 3, height: 36, backgroundColor: '#38bdf8', border: 'none', x: "-50%", y: "-50%", opacity: 1 },
        hero: { width: 140, height: 140, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.4)', x: "-50%", y: "-50%", opacity: 1 },
        hidden: { width: 0, height: 0, opacity: 0 }
    };

    return (
        <div className="custom-cursor fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className="absolute top-0 left-0 rounded-full flex items-center justify-center pointer-events-none shadow-sm"
                        style={{ x: dotX, y: dotY }}
                        variants={dotVariants}
                        animate={cursorState}
                        transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.1 }}
                    >
                        <AnimatePresence mode="wait">
                            {cursorState === 'gallery' && (
                                <motion.span
                                    key="gallery-text"
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6 }}
                                    className="text-white font-serif font-black text-[11px] tracking-[0.25em] uppercase"
                                >
                                    Explore
                                </motion.span>
                            )}
                            {cursorState === 'hero' && (
                                <motion.div
                                    key="hero-dot"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-2 h-2 rounded-full bg-white animate-pulse"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
