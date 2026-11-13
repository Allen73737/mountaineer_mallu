import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wind, Thermometer, MapPin, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool, getHeroImageUrl } from '../../data/peaks';
import { srcSetFor } from '../../lib/img';
import { timeGreeting } from './ConsoleKit';

/** Today's featured peak — the same pick as the homepage hero, so the dashboards share its photograph. */
export const useTodaysPeak = () => {
    const { theme, weather } = useStore();
    return useMemo(() => {
        const d = new Date();
        const peak = peaksData[(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % peaksData.length];
        const hour = d.getHours();
        const dark = theme === 'dark' || (theme === 'system' && (hour < 6 || hour >= 20));
        const freezing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        let src: string;
        if (peak.images) src = dark ? peak.images.night : freezing ? peak.images.snowy : peak.images.default;
        else {
            const h = hashPeakName(peak.name);
            src = dark ? nightPool[h % nightPool.length] : freezing ? snowyPool[h % snowyPool.length] : defaultPool[h % defaultPool.length];
        }
        return { peak, src };
    }, [theme, weather.isSnowing, weather.temp]);
};

const AlpineClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    return <>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })} CET</>;
};

const fmtCoord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(3)}°${v >= 0 ? pos : neg}`;

/**
 * Cinematic dashboard header in the language of the public site: the day's peak photograph,
 * a serif greeting, mono telemetry (live weather, wind, coordinates, Alpine clock) and an altitude scale.
 */
export const SummitHero: React.FC<{
    eyebrow: string;
    name?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    stats?: { label: string; value: React.ReactNode }[];
    className?: string;
}> = ({ eyebrow, name, title, subtitle, actions, stats, className = '' }) => {
    const { peak, src } = useTodaysPeak();
    const weather = useStore(s => s.weather);
    const reduce = useReducedMotion();
    const [loaded, setLoaded] = useState(false);
    const elevation = parseInt(peak.elevation.replace(/\D/g, ''), 10) || 4000;

    return (
        <section className={`relative overflow-hidden rounded-[1.75rem] min-h-[300px] md:min-h-[360px] text-white isolate mm-rise ${className}`}>
            {/* Photograph */}
            <div className="absolute inset-0 -z-10 bg-[#0B1626]">
                <motion.img
                    src={getHeroImageUrl(src)}
                    srcSet={srcSetFor(src)}
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    alt={`${peak.name}, ${peak.location}`}
                    onLoad={() => setLoaded(true)}
                    initial={{ scale: 1.12, opacity: 0 }}
                    animate={{ scale: reduce ? 1.04 : [1.08, 1.02], opacity: loaded ? 1 : 0 }}
                    transition={{ scale: { duration: 24, ease: 'linear', repeat: reduce ? 0 : Infinity, repeatType: 'mirror' }, opacity: { duration: 1.2 } }}
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#05080D]/90 via-[#05080D]/55 to-[#05080D]/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080D]/85 via-transparent to-[#05080D]/30" />
                {/* Contours */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-screen" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <path key={i} d={`M0 ${250 + i * 18} C 220 ${170 + i * 16}, 420 ${300 + i * 10}, 640 ${200 + i * 15} S 1000 ${150 + i * 18}, 1200 ${230 + i * 14}`} fill="none" stroke="#A3C9E2" strokeWidth="1" />
                    ))}
                </svg>
            </div>

            {/* Altitude scale */}
            <div className="hidden md:flex absolute right-5 top-6 bottom-6 flex-col justify-between items-end font-mono text-[9px] tracking-[0.2em] text-white/45 pointer-events-none" aria-hidden="true">
                {[1, 0.75, 0.5, 0.25, 0].map(f => (
                    <span key={f} className="flex items-center gap-2">{Math.round(elevation * f).toLocaleString()} m<span className={`h-px ${f === 1 ? 'w-6 bg-[#E2A071]' : 'w-3 bg-white/40'}`} /></span>
                ))}
            </div>

            <div className="relative h-full flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10 md:pr-28 min-h-[inherit]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <p className="font-mono text-[10px] sm:text-[10.5px] tracking-[0.28em] uppercase text-white/70 flex items-center gap-2.5">
                        <span className="w-6 h-px bg-[#E2A071]" /> {eyebrow}
                    </p>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </div>

                <div className="max-w-3xl">
                    <h1 className="font-serif text-[2.6rem] sm:text-6xl md:text-7xl leading-[0.95] tracking-tight [text-shadow:0_4px_40px_rgba(0,0,0,0.45)]">
                        {title ?? <>{timeGreeting()},<br className="sm:hidden" /> <em className="text-alpine-glacier">{name}</em></>}
                    </h1>
                    {subtitle && <p className="mt-4 text-sm sm:text-base text-white/75 max-w-xl leading-relaxed">{subtitle}</p>}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    {/* Telemetry */}
                    <dl className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-white/70">
                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#E2A071]" /><dt className="sr-only">Objective</dt><dd>{peak.name} · {peak.elevation}</dd></div>
                        {weather.temp !== null && <div className="flex items-center gap-1.5"><Thermometer size={12} /><dt className="sr-only">Summit weather</dt><dd>{weather.temp.toFixed(1)}°C · {weather.condition}</dd></div>}
                        {typeof weather.wind === 'number' && <div className="flex items-center gap-1.5"><Wind size={12} /><dt className="sr-only">Wind</dt><dd>{Math.round(weather.wind)} km/h</dd></div>}
                        <div className="hidden sm:flex items-center gap-1.5"><dt className="sr-only">Coordinates</dt><dd>{fmtCoord(peak.lat, 'N', 'S')} {fmtCoord(peak.lon, 'E', 'W')}</dd></div>
                        <div className="flex items-center gap-1.5"><Clock size={12} /><dt className="sr-only">Alpine time</dt><dd><AlpineClock /></dd></div>
                    </dl>

                    {stats && stats.length > 0 && (
                        <div className="flex gap-px rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-md self-start lg:self-auto">
                            {stats.map(s => (
                                <div key={s.label} className="px-4 sm:px-5 py-3 bg-[#05080D]/35 min-w-[92px]">
                                    <p className="font-display text-2xl sm:text-3xl font-light tabular-nums leading-none">{s.value}</p>
                                    <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/60 mt-1.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
