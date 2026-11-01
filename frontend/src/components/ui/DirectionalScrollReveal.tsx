import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface DirectionalScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    delay?: number;
}

/**
 * Scroll-linked section transition.
 * Enter: rises, fades in and irises open from a letterboxed frame while its top travels from
 *        the bottom of the viewport to 80%.
 * Exit:  eases back, dims and irises closed while its bottom leaves the top of the viewport.
 * Values are motion values bound straight to style (no React re-renders). At rest — anywhere
 * between those two windows — every value is identity, so framer emits `transform: none` and
 * position:fixed/sticky descendants behave normally.
 */
export const DirectionalScrollReveal: React.FC<DirectionalScrollRevealProps> = ({
    children,
    className = '',
    id,
}) => {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();

    const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.8'] });
    const { scrollYProgress: exit } = useScroll({ target: ref, offset: ['end 0.3', 'end start'] });

    const y = useTransform([enter, exit], ([e, x]: number[]) => (1 - e) * 56 - x * 40);
    const scale = useTransform(exit, [0, 1], [1, 0.965]);
    const opacity = useTransform([enter, exit], ([e, x]: number[]) => Math.min(0.15 + e * 0.85, 1 - x * 0.55));
    // Cinematic iris: the section opens out of a letterboxed, rounded frame on the way in and
    // closes back into one on the way out. 'none' at rest so fixed/sticky children are never clipped.
    const clipPath = useTransform([enter, exit], ([e, x]: number[]) => {
        const open = Math.min(e, 1 - x);
        if (open >= 1) return 'none';
        const t = 1 - open;
        return `inset(${(t * 10).toFixed(2)}% ${(t * 6).toFixed(2)}% ${(t * 10).toFixed(2)}% ${(t * 6).toFixed(2)}% round ${(t * 56).toFixed(1)}px)`;
    });

    return (
        <section ref={ref} id={id} className={`relative w-full section-contain ${className}`}>
            <motion.div
                style={reduce ? undefined : { y, scale, opacity, clipPath, transformOrigin: '50% 0%' }}
                className="w-full"
            >
                {children}
            </motion.div>
        </section>
    );
};
