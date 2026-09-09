import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

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
        // Mobile / Touch check: Native scrolling is much smoother on mobile touch devices
        const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches);

        if (isTouchDevice) {
            return; // Use 100% native smooth touch scrolling on mobile
        }

        // Ultra-buttery smooth Lenis inertia scroll configuration
        const lenis = new Lenis({
            duration: 1.05,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.2,
            infinite: false,
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

        // High-precision RAF loop
        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (typeof document !== 'undefined') {
                document.body.classList.remove('is-scrolling');
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
