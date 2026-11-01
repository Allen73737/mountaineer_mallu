import { useEffect, useMemo, useRef, useState } from 'react';
import { useLenis } from './SmoothScrollProvider';
import { scrollToSectionId } from '../../lib/useSectionNavigator';
import { peaksData } from '../../data/peaks';

const CHECKPOINTS = [
    { id: 'mission', label: 'Mission' },
    { id: 'stories', label: 'Stories' },
    { id: 'community', label: 'Community' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'team', label: 'Team' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Summit' },
];

interface Marker { id: string; label: string; at: number }

/**
 * Home-page "ascent" meter (desktop). Scrolling the page climbs from 0 m to today's featured peak
 * (same daily pick as the loader), with a checkpoint per section. Climber position, fill and the
 * altitude readout are written straight to the DOM from a rAF-throttled scroll handler — no React
 * re-renders while scrolling. Checkpoint positions are re-measured as lazy sections mount.
 */
export const AltitudeGauge = () => {
    const { lenis } = useLenis();
    const rootRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const climberRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLSpanElement>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const markersRef = useRef<Marker[]>([]);
    const dotsRef = useRef<HTMLElement[]>([]);
    const passedRef = useRef<string[]>([]);

    const peak = useMemo(() => {
        const d = new Date();
        const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        return peaksData[seed % peaksData.length];
    }, []);
    const summit = parseInt(peak.elevation.replace(/[^0-9]/g, ''), 10) || 4809;

    useEffect(() => {
        let frame = 0;
        // Layout is read only in measure() (on resize / when the page height changes), never per scroll frame:
        // reading scrollHeight inside the scroll handler forced a full layout on every frame
        let max = 1;
        let heroEnd = 0;
        let lastReadout = -1;
        let lastVisible = '';

        const measure = () => {
            max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const hero = document.getElementById('hero');
            heroEnd = hero ? hero.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.45 : window.innerHeight * 0.55;
            const next = CHECKPOINTS.flatMap(c => {
                const el = document.getElementById(c.id);
                if (!el) return [];
                const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
                return [{ ...c, at: Math.min(1, Math.max(0, top / max)) }];
            });
            const changed = next.length !== markersRef.current.length ||
                next.some((m, i) => Math.abs(m.at - markersRef.current[i].at) > 0.004);
            if (changed) { markersRef.current = next; setMarkers(next); }
        };

        const update = () => {
            frame = 0;
            const y = window.scrollY;
            const p = Math.min(1, Math.max(0, y / max));
            if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
            if (climberRef.current) climberRef.current.style.transform = `translate3d(0, ${(-p * 100).toFixed(2)}cqh, 0)`;
            const metres = Math.round(p * summit);
            if (metres !== lastReadout && readoutRef.current) { lastReadout = metres; readoutRef.current.textContent = metres.toLocaleString(); }
            // Reveal once the hero (and its own altimeter) has scrolled away
            const visible = String(y > heroEnd);
            if (visible !== lastVisible && rootRef.current) { lastVisible = visible; rootRef.current.dataset.visible = visible; }
            // Light up the checkpoints already passed (attribute writes only when a flag flips)
            dotsRef.current.forEach((m, i) => {
                const passed = String(p + 0.001 >= Number(m.dataset.at));
                if (passedRef.current[i] !== passed) { passedRef.current[i] = passed; m.dataset.passed = passed; }
            });
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        const remeasure = () => { measure(); schedule(); };

        measure();
        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', remeasure, { passive: true });
        // Lazy sections and images keep changing the page height after mount
        const ro = new ResizeObserver(remeasure);
        ro.observe(document.body);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            ro.disconnect();
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', remeasure);
        };
    }, [summit]);

    // Markers render after measure(); cache their elements once they exist
    useEffect(() => {
        dotsRef.current = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-at]') ?? []);
        passedRef.current = [];
    }, [markers]);

    return (
        <div
            ref={rootRef}
            data-visible="false"
            className="altitude-gauge hidden lg:flex fixed right-6 xl:right-8 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 select-none transition-[opacity,translate] duration-700 data-[visible=false]:opacity-0 data-[visible=false]:translate-x-4 data-[visible=false]:pointer-events-none"
            aria-label={`Ascent progress toward ${peak.name}`}
        >
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-alpine-navy/50 dark:text-white/40 [writing-mode:vertical-rl] rotate-180 mb-1">
                {peak.name}
            </span>

            {/* Track: checkpoints positioned by where each section starts on the page */}
            <div className="relative h-[46vh] w-6 flex justify-center [container-type:size]">
                <div className="altitude-gauge__track absolute inset-y-0 w-[2px] rounded-full" />
                <div ref={fillRef} className="altitude-gauge__fill absolute inset-y-0 w-[2px] rounded-full" style={{ transform: 'scaleY(0)' }} />

                {markers.map(m => (
                    <button
                        key={m.id}
                        type="button"
                        data-at={m.at}
                        data-passed="false"
                        onClick={() => scrollToSectionId(m.id, lenis)}
                        className="tap-dot group absolute left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-4 flex items-center justify-center cursor-pointer"
                        style={{ bottom: `${m.at * 100}%` }}
                        aria-label={`Go to ${m.label}`}
                    >
                        <span className="w-2 h-[2px] rounded-full bg-alpine-navy/30 dark:bg-white/30 transition-all duration-500 group-data-[passed=true]:w-3 group-data-[passed=true]:bg-alpine-sunrise group-hover:w-4" />
                        <span className="absolute right-full mr-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap bg-white/80 dark:bg-black/60 text-alpine-navy dark:text-white backdrop-blur-md opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                            {m.label}
                        </span>
                    </button>
                ))}

                {/* Climber */}
                <div ref={climberRef} className="absolute bottom-0 left-1/2 -ml-[5px] w-[10px] h-[10px] pointer-events-none will-change-transform">
                    <span className="absolute inset-0 -translate-y-1/2 rounded-full bg-white border-2 border-alpine-sunrise shadow-[0_0_12px_rgba(226,160,113,0.9)]" />
                </div>
            </div>

            <div className="flex flex-col items-center leading-none mt-1">
                <span ref={readoutRef} className="font-mono text-xs font-semibold tabular-nums text-alpine-navy dark:text-white">0</span>
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-alpine-navy/50 dark:text-white/40 mt-1">metres</span>
            </div>
        </div>
    );
};
