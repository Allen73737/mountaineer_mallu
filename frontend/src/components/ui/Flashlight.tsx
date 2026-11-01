import { useEffect } from 'react';

/**
 * Headlamp for dark sections: any element with the `.flashlight` class gets `--fx/--fy` (pointer
 * position inside it) and `data-lit` while the cursor is over it; index.css paints a warm pool of
 * light there that also lifts a faint contour texture. Fine pointers only, one rAF per move.
 */
export const Flashlight = () => {
    useEffect(() => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame = 0;
        let x = 0, y = 0;
        let target: Element | null = null;
        let lit: HTMLElement | null = null;

        const apply = () => {
            frame = 0;
            const el = target instanceof Element ? target.closest<HTMLElement>('.flashlight') : null;
            if (lit && lit !== el) lit.dataset.lit = 'false';
            lit = el;
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty('--fx', `${(x - r.left).toFixed(0)}px`);
            el.style.setProperty('--fy', `${(y - r.top).toFixed(0)}px`);
            el.dataset.lit = 'true';
        };
        const onMove = (e: PointerEvent) => {
            x = e.clientX; y = e.clientY; target = e.target as Element;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onLeave = () => { if (lit) lit.dataset.lit = 'false'; lit = null; };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return null;
};
