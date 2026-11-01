import { useEffect, useRef } from 'react';
import { useDeviceOptimization } from '../../lib/deviceOptimization';

type CursorState = 'default' | 'link' | 'text' | 'view' | 'read' | 'play' | 'explore' | 'scroll';

// Elements can ask for a labelled cursor with data-cursor="view|read|play|explore"
const LABELS: Record<string, string> = { view: 'View', read: 'Read', play: 'Play', explore: 'Explore', scroll: 'Scroll' };

/**
 * "Summit compass" cursor (fine pointers only). A copper summit dot tracks the pointer exactly; a fine
 * compass ring follows with a soft lag and inverts against whatever is underneath, so it reads on
 * both day and night pages. Hovering links opens the ring; cards, photos and video turn it into a
 * labelled disc; text fields hand back the native caret. Position is written straight to transforms
 * from a rAF loop that only runs while the ring is catching up; states are CSS via data attributes,
 * so moving the mouse never re-renders React.
 */
export const CustomCursor = () => {
    const { enableCustomCursor } = useDeviceOptimization();
    if (!enableCustomCursor) return null;
    return <SummitCursor />;
};

const SummitCursor = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth < 768) return;
        const root = rootRef.current, dot = dotRef.current, ring = ringRef.current, label = labelRef.current;
        if (!root || !dot || !ring || !label) return;

        const html = document.documentElement;
        html.classList.add('has-mm-cursor');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const target = { x: -100, y: -100 };
        const ringPos = { x: -100, y: -100 };
        let frame = 0;
        let state: CursorState = 'default';
        let lastEl: Element | null = null;

        const render = () => {
            frame = 0;
            const ease = reduce ? 1 : 0.2;
            ringPos.x += (target.x - ringPos.x) * ease;
            ringPos.y += (target.y - ringPos.y) * ease;
            dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
            if (Math.abs(target.x - ringPos.x) > 0.1 || Math.abs(target.y - ringPos.y) > 0.1) frame = requestAnimationFrame(render);
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };

        const setState = (next: CursorState) => {
            if (next === state) return;
            state = next;
            root.dataset.state = next;
            if (LABELS[next]) label.textContent = LABELS[next];
        };

        const classify = (el: Element | null): CursorState => {
            if (!el) return 'default';
            const hinted = el.closest<HTMLElement>('[data-cursor]');
            const hint = hinted?.dataset.cursor;
            if (hint && LABELS[hint]) return hint as CursorState;
            if (el.closest('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=submit]):not([type=button]), textarea, [contenteditable="true"], select')) return 'text';
            if (el.tagName === 'VIDEO') return 'play';
            if (el.closest('.gallery-item')) return 'explore';
            if (el.tagName === 'IMG' && el.closest('a, .cursor-pointer')) return 'view';
            if (el.closest('a, button, [role="button"], label, summary, .cursor-pointer')) return 'link';
            return 'default';
        };

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            target.x = e.clientX;
            target.y = e.clientY;
            if (root.dataset.visible !== 'true') {
                // Appear exactly at the pointer instead of flying in from the corner
                ringPos.x = target.x; ringPos.y = target.y;
                root.dataset.visible = 'true';
            }
            schedule();
        };
        const onOver = (e: PointerEvent) => {
            if (e.target === lastEl) return;
            lastEl = e.target as Element;
            setState(classify(lastEl));
        };
        const onLeave = (e: PointerEvent) => { if (!e.relatedTarget) root.dataset.visible = 'false'; };
        const onDown = () => { root.dataset.down = 'true'; };
        const onUp = () => { root.dataset.down = 'false'; };
        // Content moves under a still pointer while scrolling: re-check what's beneath it
        const onScroll = () => {
            if (root.dataset.visible !== 'true') return;
            const el = document.elementFromPoint(target.x, target.y);
            if (el !== lastEl) { lastEl = el; setState(classify(el)); }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerover', onOver, { passive: true });
        window.addEventListener('pointerout', onLeave, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            if (frame) cancelAnimationFrame(frame);
            html.classList.remove('has-mm-cursor');
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerover', onOver);
            window.removeEventListener('pointerout', onLeave);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <div ref={rootRef} className="mm-cursor" data-state="default" data-visible="false" data-down="false" aria-hidden="true">
            <div ref={ringRef} className="mm-cursor__ring">
                <div className="mm-cursor__halo">
                    <svg className="mm-cursor__ticks" viewBox="0 0 40 40">
                        <path d="M20 1.5v4M20 34.5v4M1.5 20h4M34.5 20h4" />
                    </svg>
                </div>
                <div className="mm-cursor__disc" />
                <span ref={labelRef} className="mm-cursor__label">View</span>
            </div>
            <div ref={dotRef} className="mm-cursor__dot" />
        </div>
    );
};
