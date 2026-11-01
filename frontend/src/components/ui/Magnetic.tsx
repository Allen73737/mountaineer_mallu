import React, { useEffect, useRef } from 'react';

/**
 * Magnetic call-to-action wrapper. Within `radius` px of the button the content leans toward the
 * cursor and a soft glow (`.magnetic::before`, driven by `--mag`) swells as it gets closer.
 * Fine pointers only; writes transforms/vars straight to the DOM from a rAF-throttled listener.
 */
export const Magnetic = ({ children, className = '', strength = 0.32, radius = 140, glow = 'rgba(226,160,113,0.55)' }: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    radius?: number;
    glow?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame = 0;
        let px = 0, py = 0;
        let engaged = false;

        const apply = () => {
            frame = 0;
            const r = el.getBoundingClientRect();
            if (r.width === 0) return;
            const dx = px - (r.left + r.width / 2);
            const dy = py - (r.top + r.height / 2);
            // Distance from the button's edge, not its centre, so wide buttons feel the same as round ones
            const ex = Math.max(0, Math.abs(dx) - r.width / 2);
            const ey = Math.max(0, Math.abs(dy) - r.height / 2);
            const pull = Math.max(0, 1 - Math.hypot(ex, ey) / radius);
            if (pull === 0 && !engaged) return;
            engaged = pull > 0;
            const k = pull * strength;
            el.style.setProperty('--mag', pull.toFixed(3));
            el.style.setProperty('--mag-x', `${(dx * k).toFixed(1)}px`);
            el.style.setProperty('--mag-y', `${(dy * k).toFixed(1)}px`);
        };
        const onMove = (e: PointerEvent) => {
            px = e.clientX; py = e.clientY;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [strength, radius]);

    return (
        <div ref={ref} className={`magnetic ${className}`} style={{ '--mag-glow': glow } as React.CSSProperties}>
            {children}
        </div>
    );
};
