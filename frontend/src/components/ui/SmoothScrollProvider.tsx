import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { cancelFrame, frame } from 'framer-motion';

export type ScrollDirection = 'down' | 'up' | 'idle';

interface SmoothScrollContextType {
    lenis: Lenis | null;
    scrollVelocity: number;
    scrollProgress: number;
    scrollDirection: ScrollDirection;
    isScrolling: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
    lenis: null,
    scrollVelocity: 0,
    scrollProgress: 0,
    scrollDirection: 'idle',
    isScrolling: false,
});

export const useLenis = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

    const scrollVelocityRef = useRef<number>(0);
    const scrollProgressRef = useRef<number>(0);
    const scrollDirectionRef = useRef<ScrollDirection>('idle');
    const isScrollingRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // True coarse-only mobile phone check: native touch scrolling is ideal for pocket smartphones,
        // while touchscreen laptops, hybrids, tablets with pointers, and desktop monitors get silky Lenis inertia
        const isCoarseOnlyMobile = typeof window !== 'undefined' && 
            window.innerWidth < 768 && 
            window.matchMedia('(pointer: coarse) and (hover: none)').matches;

        if (isCoarseOnlyMobile) {
            return; // Use 100% native smooth touch scrolling on pocket phones
        }

        // Frame-rate-independent lerp instead of a fixed-duration tween: the page starts moving on the very
        // next frame after a wheel tick and each new tick retargets smoothly (no restart of a 1 s curve),
        // so it stays silky but follows input with minimal latency
        const lenis = new Lenis({
            lerp: 0.11,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            infinite: false,
            autoResize: true,
        });

        setLenisInstance(lenis);

        const handleScroll = (e: any) => {
            const dir: ScrollDirection = e.direction === 1 ? 'down' : e.direction === -1 ? 'up' : 'idle';
            scrollVelocityRef.current = e.velocity || 0;
            scrollProgressRef.current = e.progress || 0;
            scrollDirectionRef.current = dir;

            if (!isScrollingRef.current) {
                isScrollingRef.current = true;
                if (typeof document !== 'undefined') {
                    document.body.classList.add('is-scrolling');
                }
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
                scrollDirectionRef.current = 'idle';
                scrollVelocityRef.current = 0;
                if (typeof document !== 'undefined') {
                    document.body.classList.remove('is-scrolling');
                }
            }, 100);
        };

        lenis.on('scroll', handleScroll);

        // Ultra-responsive resize listener: prevents jank when resizing between aspect ratios
        let resizeTimeout: any = null;
        const handleResize = () => {
            if (typeof document !== 'undefined') {
                document.body.classList.add('is-resizing');
            }
            lenis.resize();

            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (typeof document !== 'undefined') {
                    document.body.classList.remove('is-resizing');
                }
                lenis.resize();
            }, 150);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', handleResize, { passive: true });

        // Observe DOM mutations / dynamic height expansions (accordion expansions, image loads, skeletal resolves)
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && document.documentElement) {
            resizeObserver = new ResizeObserver(() => {
                lenis.resize();
            });
            resizeObserver.observe(document.documentElement);
        }

        // Step Lenis inside framer-motion's own frame loop (its "update" phase runs before framer reads
        // scroll and renders), so the scroll position and every scroll-linked animation move in the same
        // frame — no one-frame lag between two independent rAF loops
        const raf = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
        frame.update(raf, true);

        return () => {
            cancelFrame(raf);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (resizeTimeout) clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (resizeObserver) resizeObserver.disconnect();
            if (typeof document !== 'undefined') {
                document.body.classList.remove('is-scrolling');
                document.body.classList.remove('is-resizing');
            }
            lenis.off('scroll', handleScroll);
            lenis.destroy();
            setLenisInstance(null);
        };
    }, []);

    // Memoize context value strictly on lenis instance only, so 0 re-renders occur while scrolling!
    const contextValue = React.useMemo(() => ({
        lenis: lenisInstance,
        get scrollVelocity() { return scrollVelocityRef.current; },
        get scrollProgress() { return scrollProgressRef.current; },
        get scrollDirection() { return scrollDirectionRef.current; },
        get isScrolling() { return isScrollingRef.current; },
    }), [lenisInstance]);

    return (
        <SmoothScrollContext.Provider value={contextValue}>
            {children}
        </SmoothScrollContext.Provider>
    );
};
