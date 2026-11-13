import React, { useId, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Odometer } from '../ui/Odometer';

/**
 * Shared building blocks for the explorer portal and Summit Control, so both read
 * like the public site: mono telemetry eyebrow, Instrument Serif headline, glacier light.
 * Styling lives in index.css under "BASECAMP CONSOLE".
 */

export const ConsoleHeader: React.FC<{
    eyebrow: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}> = ({ eyebrow, title, description, actions, className = '' }) => (
    <header className={`mm-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8 md:mb-10 ${className}`}>
        <div className="min-w-0">
            <p className="mm-eyebrow mb-3">{eyebrow}</p>
            <h1 className="mm-title text-[2.4rem] sm:text-5xl md:text-[3.5rem]">{title}</h1>
            {description && <p className="mm-muted text-sm md:text-base mt-3 max-w-2xl leading-relaxed">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </header>
);

export const Panel: React.FC<React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }> = ({ interactive, className = '', children, ...rest }) => (
    <div className={`mm-panel ${interactive ? 'mm-panel--interactive' : ''} ${className}`} {...rest}>{children}</div>
);

export const PanelTitle: React.FC<{ eyebrow?: string; title: React.ReactNode; action?: React.ReactNode }> = ({ eyebrow, title, action }) => (
    <div className="flex items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
            {eyebrow && <p className="mm-eyebrow mm-eyebrow--bare mb-1.5">{eyebrow}</p>}
            <h2 className="mm-title text-2xl md:text-[1.75rem] truncate">{title}</h2>
        </div>
        {action}
    </div>
);

export const PanelLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link to={to} className="group inline-flex items-center gap-1 text-xs font-medium mm-muted hover:text-[var(--mm-ink)] transition-colors shrink-0">
        {children}
        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
);

/** Smooth area sparkline. Pure SVG — no chart library, no layout cost. */
export const Sparkline: React.FC<{ data: number[]; className?: string; color?: string }> = ({ data, className = '', color = '#A3C9E2' }) => {
    const id = useId().replace(/:/g, '');
    const { line, area, last } = useMemo(() => {
        const w = 100, h = 32, pad = 2;
        const max = Math.max(1, ...data);
        const pts = data.map((v, i) => [
            data.length > 1 ? (i / (data.length - 1)) * w : w / 2,
            h - pad - (v / max) * (h - pad * 2),
        ]);
        // Catmull-Rom → cubic Bézier for a soft, honest curve through every point
        let d = pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
            const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
            const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
            d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
        }
        return { line: d, area: pts.length ? `${d} L${w},${h} L0,${h} Z` : '', last: pts[pts.length - 1] };
    }, [data]);

    if (!data.length) return null;
    return (
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={`w-full overflow-visible ${className}`} aria-hidden="true">
            <defs>
                <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#spark-${id})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            {last && <circle cx={last[0]} cy={last[1]} r="1.6" fill={color} vectorEffect="non-scaling-stroke" />}
        </svg>
    );
};

export const StatTile: React.FC<{
    label: string;
    value: number;
    icon: LucideIcon;
    caption?: React.ReactNode;
    delta?: number | null;
    trend?: number[];
    to?: string;
    delay?: number;
}> = ({ label, value, icon: Icon, caption, delta, trend, to, delay = 0 }) => {
    const body = (
        <Panel interactive={!!to} className="p-5 md:p-6 h-full overflow-hidden mm-rise" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between gap-3">
                <p className="mm-eyebrow mm-eyebrow--bare">{label}</p>
                <span className="grid place-items-center w-9 h-9 rounded-full border border-[var(--mm-line)] text-[var(--mm-glacier)]">
                    <Icon size={16} strokeWidth={1.75} />
                </span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
                <Odometer value={value} className="mm-num text-[2.6rem] md:text-5xl font-light" />
                {typeof delta === 'number' && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full border ${delta >= 0 ? 'text-emerald-300 border-emerald-300/20 bg-emerald-300/[0.06]' : 'text-[#E8A08C] border-[#E8A08C]/20 bg-[#E8A08C]/[0.06]'}`}>
                        {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {delta >= 0 ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
            {trend && trend.length > 1 ? <Sparkline data={trend} className="h-9 mt-4" /> : <div className="h-px mt-5 bg-[var(--mm-line)]" />}
            {caption && <p className="mm-faint text-xs mt-3">{caption}</p>}
        </Panel>
    );
    return to ? <Link to={to} className="block h-full">{body}</Link> : body;
};

/** Thin progress rail used for capacity / completion. */
export const Meter: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = '' }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className={`h-1 rounded-full bg-[var(--mm-line)] overflow-hidden ${className}`} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
            <div
                className="h-full rounded-full origin-left"
                style={{
                    width: `${pct}%`,
                    background: pct >= 90 ? 'linear-gradient(90deg,#E2A071,#D4775A)' : 'linear-gradient(90deg,#4A6A8C,#A3C9E2)',
                    animation: 'mm-meter 1.1s cubic-bezier(0.16,1,0.3,1) both',
                }}
            />
        </div>
    );
};

export const timeGreeting = (d = new Date()) => {
    const h = d.getHours();
    if (h < 5) return 'Still climbing';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};
