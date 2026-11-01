import { useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform, useVelocity } from 'framer-motion';
import { useQuality } from '../../lib/quality';

// The climb section of the hero's scroll (after the title breaks up, before the summit reveal)
const CLIMB: [number, number, number, number] = [0.08, 0.18, 0.62, 0.74];
const FILM_SECONDS = 96;

interface Flake { x: number; y: number; z: number; pz: number }

/**
 * Snow and ice crystals rushing past the lens while the camera climbs. A 3D point field projected
 * from a vanishing point just above centre: each flake is drawn as a streak from where it was last
 * frame to where it is now, so faster scrolling (the camera climbing harder) stretches the streaks.
 */
const RushCanvas = ({ progress, active }: { progress: MotionValue<number>; active: MotionValue<number> }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const velocity = useVelocity(progress);
    const tier = useQuality(s => s.tier);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.5 : 1);
        let w = 0, h = 0;
        const resize = () => {
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const count = tier === 'high' ? 260 : 130;
        const reset = (f: Flake, far: boolean) => {
            f.x = (Math.random() - 0.5) * 2.4;
            f.y = (Math.random() - 0.5) * 2.4;
            f.z = far ? 1 : 0.05 + Math.random() * 0.95;
            f.pz = f.z;
        };
        const flakes: Flake[] = Array.from({ length: count }, () => { const f = { x: 0, y: 0, z: 0, pz: 0 }; reset(f, false); return f; });

        const BUCKETS = 5;
        const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
        let frame = 0;
        let running = false;
        const loop = () => {
            frame = requestAnimationFrame(loop);
            ctx.clearRect(0, 0, w, h);
            // Idle drift plus a boost from how fast the visitor is scrolling through the climb
            const speed = 0.004 + Math.min(0.05, Math.abs(velocity.get()) * 0.03);
            const cx = w / 2, cy = h * 0.42, scale = Math.max(w, h) * 0.5;
            ctx.strokeStyle = '#F4F8FF';
            ctx.lineCap = 'round';
            // Streaks are bucketed by depth: one path and one stroke per bucket instead of per flake
            for (const b of buckets) b.length = 0;
            for (const f of flakes) {
                f.pz = f.z;
                f.z -= speed;
                if (f.z <= 0.02) { reset(f, true); continue; }
                const sx = cx + (f.x / f.z) * scale, sy = cy + (f.y / f.z) * scale;
                const px = cx + (f.x / f.pz) * scale, py = cy + (f.y / f.pz) * scale;
                if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) { reset(f, true); continue; }
                buckets[Math.min(BUCKETS - 1, Math.floor((1 - f.z) * BUCKETS))].push(px, py, sx, sy);
            }
            buckets.forEach((seg, i) => {
                if (!seg.length) return;
                const near = (i + 0.5) / BUCKETS;
                ctx.globalAlpha = Math.min(0.85, near * near * 0.9);
                ctx.lineWidth = 0.5 + near * 2.2;
                ctx.beginPath();
                for (let k = 0; k < seg.length; k += 4) { ctx.moveTo(seg[k], seg[k + 1]); ctx.lineTo(seg[k + 2], seg[k + 3]); }
                ctx.stroke();
            });
            ctx.globalAlpha = 1;
        };
        // Only animate while the climb is on screen
        const sync = (v: number) => {
            if (v > 0.01 && !running) { running = true; frame = requestAnimationFrame(loop); }
            else if (v <= 0.01 && running) { running = false; cancelAnimationFrame(frame); ctx.clearRect(0, 0, w, h); }
        };
        sync(active.get());
        const unsub = active.on('change', sync);
        return () => {
            unsub();
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
        };
    }, [active, velocity, tier]);

    return <motion.canvas ref={canvasRef} style={{ opacity: active }} className="absolute inset-0 w-full h-full" />;
};

/**
 * Turns the hero's scroll-scrubbed climb into footage: a slate and running timecode print over the
 * frame while the camera climbs, and snow streaks rush past the lens at the speed you scroll.
 * Full-bleed — no letterbox bars.
 */
export const AscentFilm = ({ progress }: { progress: MotionValue<number> }) => {
    const tier = useQuality(s => s.tier);
    const slate = useTransform(progress, [CLIMB[0] + 0.05, CLIMB[1], CLIMB[2], CLIMB[3] - 0.04], [0, 1, 1, 0]);
    const rush = useTransform(progress, [CLIMB[0], CLIMB[1], CLIMB[2] - 0.08, CLIMB[2]], [0, 0.9, 0.9, 0]);
    const timecode = useTransform(progress, p => {
        const total = Math.max(0, p) * FILM_SECONDS;
        const f = Math.floor((total % 1) * 24);
        const s = Math.floor(total) % 60;
        const m = Math.floor(total / 60);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
    });
    const recBlink = useRef<HTMLSpanElement>(null);
    useMotionValueEvent(slate, 'change', v => { if (recBlink.current) recBlink.current.style.animationPlayState = v > 0 ? 'running' : 'paused'; });

    return (
        <>
            {tier !== 'low' && (
                <div aria-hidden="true" className="absolute inset-0 z-[12] pointer-events-none">
                    <RushCanvas progress={progress} active={rush} />
                </div>
            )}
            {/* Slate (under the navbar) and timecode (bottom corners), printed straight over the footage */}
            <motion.div aria-hidden="true" style={{ opacity: slate }} className="absolute inset-x-0 top-24 md:top-28 z-[39] pointer-events-none flex justify-between px-5 md:px-12 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                <span className="flex items-center gap-2"><span ref={recBlink} className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Rec · SC. 01 — The ascent</span>
                <span className="hidden sm:inline">35mm · 24 fps</span>
            </motion.div>
            <motion.div aria-hidden="true" style={{ opacity: slate }} className="absolute inset-x-0 bottom-6 md:bottom-8 z-[39] pointer-events-none flex justify-between px-5 md:px-12 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                <span>TC <motion.span className="tabular-nums text-white/90">{timecode}</motion.span></span>
                <span className="hidden sm:inline">Mountaineer Mallu · Roll 01</span>
            </motion.div>
        </>
    );
};
