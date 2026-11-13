import React, { useId, useMemo, useState } from 'react';
import { Route, TrendingUp, Mountain, Flag } from 'lucide-react';
import { haversineKm, type StoryRoute } from '../../lib/gpx';

/**
 * A story's GPS route: plan-view trace and an elevation profile with a shared scrubber.
 * Pure SVG — no map tiles, no external requests.
 */
export const RouteMap: React.FC<{ route: StoryRoute; className?: string }> = ({ route, className = '' }) => {
    const gid = useId().replace(/:/g, '');
    const [hover, setHover] = useState<number | null>(null);

    const geo = useMemo(() => {
        const pts = route.points;
        const lats = pts.map(p => p[0]), lons = pts.map(p => p[1]);
        const minLat = Math.min(...lats), maxLat = Math.max(...lats);
        const minLon = Math.min(...lons), maxLon = Math.max(...lons);
        // Equirectangular projection, scaled by cos(latitude) so shapes aren't stretched
        const k = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
        const w = Math.max(1e-6, (maxLon - minLon) * k), h = Math.max(1e-6, maxLat - minLat);
        const W = 1000, H = 600, pad = 40;
        const s = Math.min((W - pad * 2) / w, (H - pad * 2) / h);
        const ox = (W - w * s) / 2, oy = (H - h * s) / 2;
        const xy = pts.map(p => [ox + (p[1] - minLon) * k * s, H - (oy + (p[0] - minLat) * s)] as [number, number]);

        // Cumulative distance for the profile's x axis
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversineKm([pts[i - 1][0], pts[i - 1][1]], [pts[i][0], pts[i][1]]));
        const total = cum[cum.length - 1] || 1;
        const eles = pts.map(p => p[2]);
        const hasEle = eles.filter(e => e != null).length > pts.length * 0.5;
        const valid = eles.filter((e): e is number => e != null);
        const minE = valid.length ? Math.min(...valid) : 0, maxE = valid.length ? Math.max(...valid) : 1;
        const PW = 1000, PH = 220;
        let last = valid[0] ?? 0;
        const prof = pts.map((p, i) => {
            const e = p[2] ?? last; last = e;
            return [(cum[i] / total) * PW, PH - 12 - ((e - minE) / Math.max(1, maxE - minE)) * (PH - 36)] as [number, number];
        });
        return { W, H, xy, cum, total, hasEle, minE, maxE, PW, PH, prof };
    }, [route]);

    const path = geo.xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const profLine = geo.prof.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const profArea = `${profLine} L${geo.PW},${geo.PH} L0,${geo.PH} Z`;
    const start = geo.xy[0], end = geo.xy[geo.xy.length - 1];
    const hp = hover != null ? geo.xy[hover] : null;
    const hprof = hover != null ? geo.prof[hover] : null;

    const onProfileMove = (e: React.PointerEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * geo.PW;
        // Nearest sample by x
        let best = 0, bd = Infinity;
        geo.prof.forEach((p, i) => { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; best = i; } });
        setHover(best);
    };

    const stat = (Icon: typeof Route, label: string, value: string) => (
        <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] uppercase text-white/40"><Icon size={12} /> {label}</p>
            <p className="font-display text-2xl md:text-3xl font-light text-white tabular-nums mt-1">{value}</p>
        </div>
    );

    return (
        <figure className={`rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0E1826] to-[#070B12] overflow-hidden ${className}`}>
            <div className="px-6 md:px-8 pt-6 md:pt-8 flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-alpine-glacier/80">GPS route</p>
                    <h3 className="font-serif text-3xl md:text-4xl text-white mt-1">{route.name || 'The line we took'}</h3>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-10">
                    {stat(Route, 'Distance', `${route.distanceKm} km`)}
                    {stat(TrendingUp, 'Climb', `${route.gainM.toLocaleString()} m`)}
                    {stat(Mountain, 'High point', route.maxElevationM ? `${route.maxElevationM.toLocaleString()} m` : '—')}
                </div>
            </div>

            <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="w-full h-auto mt-2" role="img" aria-label={`Route map, ${route.distanceKm} kilometres`}>
                <defs>
                    <linearGradient id={`rl-${gid}`} x1="0" x2="1">
                        <stop offset="0%" stopColor="#A3C9E2" />
                        <stop offset="100%" stopColor="#E2A071" />
                    </linearGradient>
                    <filter id={`rg-${gid}`}><feGaussianBlur stdDeviation="6" /></filter>
                </defs>
                {/* faint grid */}
                {Array.from({ length: 9 }).map((_, i) => <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2={geo.H} stroke="rgba(163,201,226,0.05)" />)}
                {Array.from({ length: 5 }).map((_, i) => <line key={`h${i}`} x1="0" y1={(i + 1) * 100} x2={geo.W} y2={(i + 1) * 100} stroke="rgba(163,201,226,0.05)" />)}
                <path d={path} fill="none" stroke={`url(#rl-${gid})`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" filter={`url(#rg-${gid})`} />
                <path d={path} fill="none" stroke={`url(#rl-${gid})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="route-draw" pathLength={1} />
                <circle cx={start[0]} cy={start[1]} r="9" fill="#05080D" stroke="#A3C9E2" strokeWidth="3" />
                <g transform={`translate(${end[0]},${end[1]})`}>
                    <circle r="11" fill="#E2A071" />
                    <Flag x={-7} y={-7} width={14} height={14} color="#1B0F08" />
                </g>
                {hp && <circle cx={hp[0]} cy={hp[1]} r="8" fill="#F8FAF9" stroke="#05080D" strokeWidth="3" />}
            </svg>

            {geo.hasEle && (
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                    <svg
                        viewBox={`0 0 ${geo.PW} ${geo.PH}`}
                        preserveAspectRatio="none"
                        className="w-full h-28 md:h-36 touch-none cursor-crosshair"
                        onPointerMove={onProfileMove}
                        onPointerLeave={() => setHover(null)}
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id={`pa-${gid}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#A3C9E2" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#A3C9E2" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={profArea} fill={`url(#pa-${gid})`} />
                        <path d={profLine} fill="none" stroke="#A3C9E2" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        {hprof && <line x1={hprof[0]} x2={hprof[0]} y1="0" y2={geo.PH} stroke="rgba(248,250,249,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
                    </svg>
                    <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] text-white/40 mt-2 tabular-nums">
                        <span>0 km · {geo.minE.toLocaleString()} m</span>
                        {hover != null
                            ? <span className="text-white/80">{geo.cum[hover].toFixed(1)} km · {(route.points[hover][2] ?? 0).toLocaleString()} m</span>
                            : <span>Drag across the profile</span>}
                        <span>{geo.total.toFixed(1)} km · {geo.maxE.toLocaleString()} m</span>
                    </div>
                </div>
            )}
        </figure>
    );
};
