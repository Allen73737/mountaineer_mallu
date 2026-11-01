import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { useQuality } from '../../lib/quality';
import { weatherKind } from '../../lib/weather';

interface Drop { x: number; y: number; z: number; phase: number }

// Three depth layers (far → near). Every particle sits on one, so each layer is drawn as a single path
// with one fill / stroke per frame instead of one draw call per particle.
const LAYERS = [0.15, 0.5, 0.9];

/**
 * The real weather at today's peak, laid over the page like looking through it: snowfall, rain or a
 * storm (with lightning) on a canvas, fog as drifting CSS banks. Density follows the measured intensity
 * and everything leans and drifts with the live wind speed and direction. Clear or merely cloudy days
 * draw nothing. Particle counts scale with the quality tier; the low tier keeps only the fog.
 */
export const WeatherAtmosphere = () => {
    const weather = useStore(s => s.weather);
    const loaded = useStore(s => s.weatherLoaded);
    const tier = useQuality(s => s.tier);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);
    const { kind, intensity } = weatherKind(weather);
    const precipitating = kind === 'snow' || kind === 'rain' || kind === 'storm';
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const drawCanvas = loaded && precipitating && tier !== 'low' && !reduce;

    useEffect(() => {
        if (!drawCanvas) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const snow = kind === 'snow';
        const dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.5 : 1);
        let w = 0, h = 0;
        const resize = () => {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const area = (window.innerWidth * window.innerHeight) / (1440 * 900);
        const base = snow ? 170 : 240;
        const count = Math.round(base * (0.35 + intensity * 0.65) * area * (tier === 'high' ? 1 : 0.5));
        // Wind blows *from* windDir; on screen that is a sideways drift. East-ish winds push left, west-ish push right.
        const windKmh = weather.wind ?? 10;
        const side = weather.windDir !== undefined ? -Math.sin((weather.windDir * Math.PI) / 180) : 1;
        const drift = side * Math.min(1, windKmh / 50);

        const spawn = (d: Drop, top: boolean) => {
            d.x = Math.random() * (w + 200) - 100;
            d.y = top ? -20 - Math.random() * 60 : Math.random() * h;
            d.z = LAYERS[Math.floor(Math.random() * LAYERS.length)];
            d.phase = Math.random() * Math.PI * 2;
        };
        const drops: Drop[] = Array.from({ length: count }, () => { const d = { x: 0, y: 0, z: 0, phase: 0 }; spawn(d, false); return d; });

        let frame = 0;
        let last = performance.now();
        let nextFlash = performance.now() + 4000 + Math.random() * 8000;
        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            const dt = Math.min(50, now - last) / 16.67;
            last = now;
            ctx.clearRect(0, 0, w, h);

            if (snow) {
                ctx.fillStyle = '#fff';
                for (const z of LAYERS) {
                    // Nearer flakes (z → 1) are bigger, faster and more opaque
                    const size = 0.8 + z * 2.6;
                    ctx.globalAlpha = 0.25 + z * 0.55;
                    ctx.beginPath();
                    for (const d of drops) {
                        if (d.z !== z) continue;
                        d.phase += 0.02 * dt;
                        d.y += (0.5 + z * 1.6) * dt;
                        d.x += (drift * (1 + z * 2.5) + Math.sin(d.phase) * 0.35) * dt;
                        if (d.y > h + 10 || d.x < -120 || d.x > w + 120) spawn(d, true);
                        ctx.moveTo(d.x + size, d.y);
                        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
                    }
                    ctx.fill();
                }
            } else {
                ctx.strokeStyle = 'rgba(200,220,240,1)';
                ctx.lineCap = 'round';
                const lean = drift * 0.45;
                for (const z of LAYERS) {
                    const speed = 9 + z * 9;
                    const len = 10 + z * 14;
                    ctx.globalAlpha = 0.12 + z * 0.22;
                    ctx.lineWidth = 0.6 + z * 0.8;
                    ctx.beginPath();
                    for (const d of drops) {
                        if (d.z !== z) continue;
                        d.y += speed * dt;
                        d.x += speed * lean * dt;
                        if (d.y > h + 20) spawn(d, true);
                        ctx.moveTo(d.x, d.y);
                        ctx.lineTo(d.x - len * lean, d.y - len);
                    }
                    ctx.stroke();
                }
                // Lightning: a double flash every few seconds in a storm
                if (kind === 'storm' && now > nextFlash && flashRef.current) {
                    nextFlash = now + 6000 + Math.random() * 9000;
                    flashRef.current.animate(
                        [{ opacity: 0 }, { opacity: 0.32 }, { opacity: 0.05 }, { opacity: 0.22 }, { opacity: 0 }],
                        { duration: 650, easing: 'ease-out' },
                    );
                }
            }
            ctx.globalAlpha = 1;
        };

        const onVisibility = () => {
            if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
            else if (!frame) { last = performance.now(); frame = requestAnimationFrame(loop); }
        };
        frame = requestAnimationFrame(loop);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [drawCanvas, kind, intensity, tier, weather.wind, weather.windDir]);

    if (!loaded || reduce || kind === 'clear' || kind === 'cloudy') return null;
    const fog = kind === 'fog' ? intensity * 0.8 : kind === 'snow' || kind === 'storm' ? 0.14 : 0.08;

    return (
        <div aria-hidden="true" className="fixed inset-0 z-[9988] pointer-events-none overflow-hidden">
            <div className="weather-fog" style={{ opacity: fog }}>
                <span className="weather-fog__bank" />
                <span className="weather-fog__bank weather-fog__bank--b" />
            </div>
            {drawCanvas && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />}
            {kind === 'storm' && <div ref={flashRef} className="absolute inset-0 bg-[#E8F0FF] opacity-0 mix-blend-screen" />}
        </div>
    );
};
