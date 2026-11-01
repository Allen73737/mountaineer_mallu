import React from 'react';

/**
 * The site's buffering mark: the logo's copper ridge draws itself, a summit light climbs to the peak,
 * then the line hands off and draws again — an endless short climb instead of a generic spinner.
 * Pure SVG + CSS (stroke-dashoffset / opacity), so it costs nothing on the main thread.
 */
export const BrandLoader: React.FC<{ size?: number; className?: string; label?: string }> = ({ size = 40, className = '', label }) => (
    <span role="status" aria-label={label || 'Loading'} className={`brand-loader inline-flex flex-col items-center gap-2 ${className}`}>
        <svg width={size} height={size * 0.62} viewBox="0 0 64 40" fill="none" aria-hidden="true" className="overflow-visible">
            <path d="M4 34 L22 10 C24 7.4 26.4 7.6 28 10 C31 14.6 34 18 38 18.6 C40.4 19 41.4 16 43.6 14.6 C46.6 12.6 50.4 14 52.4 17.6 L60 30" pathLength={1} className="brand-loader__track" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 34 L22 10 C24 7.4 26.4 7.6 28 10 C31 14.6 34 18 38 18.6 C40.4 19 41.4 16 43.6 14.6 C46.6 12.6 50.4 14 52.4 17.6 L60 30" pathLength={1} className="brand-loader__ridge" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="8.6" r="2.6" className="brand-loader__summit" />
        </svg>
        {label && <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-current opacity-60">{label}</span>}
    </span>
);

/**
 * Drop-in for lucide's Loader2 (same `size` / `className` props) so every in-button spinner on the site
 * uses the brand mark. `animate-spin` is ignored — the mark animates itself.
 */
export const Loader2: React.FC<{ size?: number | string; className?: string; strokeWidth?: number }> = ({ size = 16, className = '' }) => (
    <BrandLoader size={Math.round(Number(size) * 1.5)} className={className.replace(/\banimate-spin\b/g, '').trim()} />
);

export default BrandLoader;
