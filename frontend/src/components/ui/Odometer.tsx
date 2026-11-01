import React, { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** One mechanical wheel: a 0–9 strip that spins down to its digit, with a full extra turn for the leading wheels. */
const Wheel = ({ digit, index, total, run, duration }: { digit: number; index: number; total: number; run: boolean; duration: number }) => {
    // Leftmost wheels spin the longest, like a real counter rolling over
    const turns = total - index - 1;
    // Percent of the strip's own height
    const target = -((turns * 10 + digit) / ((turns + 1) * 10)) * 100;
    return (
        <span className="relative inline-block h-[1em] leading-[1em] overflow-hidden align-baseline">
            {/* Sizes the wheel to the final digit's own width */}
            <span className="invisible">{digit}</span>
            <span
                className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
                style={{
                    transform: `translate3d(0, ${run ? target : 0}%, 0)`,
                    transition: `transform ${duration + index * 0.12}s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s`,
                }}
            >
                {Array.from({ length: turns + 1 }).flatMap((_, t) => DIGITS.map(d => (
                    <span key={`${t}-${d}`} className="block h-[1em] leading-[1em] text-center">{d}</span>
                )))}
            </span>
        </span>
    );
};

/**
 * Odometer-style number: each digit rolls on its own wheel when the number scrolls into view.
 * Separators (commas, spaces, units) stay static. Screen readers get the plain value.
 */
export const Odometer: React.FC<{ value: number; suffix?: string; prefix?: string; className?: string; duration?: number; locale?: string }> = ({
    value, suffix = '', prefix = '', className = '', duration = 1.8, locale = 'en-US',
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
    const reduce = useReducedMotion();
    const text = Math.round(value).toLocaleString(locale);
    const digitCount = text.replace(/\D/g, '').length;

    if (reduce) return <span className={`tabular-nums ${className}`}>{prefix}{text}{suffix}</span>;

    let seen = 0;
    return (
        <span ref={ref} className={`inline-flex items-baseline tabular-nums leading-none ${className}`}>
            <span className="sr-only">{prefix}{text}{suffix}</span>
            <span aria-hidden="true" className="inline-flex items-baseline">
                {prefix}
                {text.split('').map((ch, i) => /\d/.test(ch)
                    ? <Wheel key={i} digit={Number(ch)} index={seen++} total={digitCount} run={inView} duration={duration} />
                    : <span key={i} className="inline-block">{ch}</span>)}
                {suffix}
            </span>
        </span>
    );
};
