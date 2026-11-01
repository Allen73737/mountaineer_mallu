import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { splitGraphemes } from '../../lib/intro';

const EASE = [0.16, 1, 0.3, 1] as const;
// The route curtain lifts ~0.6s after navigation; start just as it clears
const START = 0.55;

/**
 * Opening-credits page title: a small "presents" credit fades in, a hairline rule draws under it,
 * then the title resolves letter by letter out of a mask (the same move as the home hero).
 * Words stay unbroken so the title still wraps naturally; `lines` forces explicit line breaks.
 */
export const CreditTitle = ({ lines, className = '', credit = 'Mountaineer Mallu presents', align = 'left', creditClassName = '' }: {
    lines: string[];
    className?: string;
    credit?: string;
    align?: 'left' | 'center';
    creditClassName?: string;
}) => {
    const reduce = useReducedMotion();
    const words = useMemo(() => lines.map(l => l.split(/\s+/).filter(Boolean).map(splitGraphemes)), [lines]);

    let n = 0; // running letter index for the stagger
    const centred = align === 'center';

    return (
        <div className={`flex flex-col ${centred ? 'items-center text-center' : 'items-start'}`}>
            <div className={`flex items-center gap-3 mb-4 md:mb-5 ${creditClassName}`}>
                <motion.span
                    aria-hidden="true"
                    className="h-px w-8 md:w-12 bg-current opacity-50 origin-left"
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay: START, ease: EASE }}
                />
                <motion.span
                    className="font-mono text-[10px] md:text-xs uppercase opacity-70"
                    initial={reduce ? false : { opacity: 0, letterSpacing: '0.7em' }}
                    animate={{ opacity: 0.7, letterSpacing: '0.35em' }}
                    transition={{ duration: 1.4, delay: START, ease: EASE }}
                >
                    {credit}
                </motion.span>
                {centred && (
                    <motion.span
                        aria-hidden="true"
                        className="h-px w-8 md:w-12 bg-current opacity-50 origin-right"
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.9, delay: START, ease: EASE }}
                    />
                )}
            </div>
            <h1 aria-label={lines.join(' ')} className={className}>
                {words.map((line, li) => (
                    <span key={li} aria-hidden="true" className="block">
                        {line.map((letters, wi) => (
                            <span key={wi} className="inline-flex overflow-hidden pb-[0.1em] -mb-[0.1em] mr-[0.25em] last:mr-0">
                                {letters.map((ch, ci) => {
                                    const i = n++;
                                    return (
                                        <motion.span
                                            key={ci}
                                            className="inline-block"
                                            initial={reduce ? false : { y: '110%', rotate: 5, opacity: 0 }}
                                            animate={{ y: '0%', rotate: 0, opacity: 1 }}
                                            transition={{ duration: 1, delay: START + 0.25 + i * 0.035, ease: EASE }}
                                        >
                                            {ch}
                                        </motion.span>
                                    );
                                })}
                            </span>
                        ))}
                    </span>
                ))}
            </h1>
            <motion.span
                aria-hidden="true"
                className={`block h-px w-24 md:w-40 mt-1 mb-6 bg-gradient-to-r from-alpine-sunrise via-alpine-gold to-transparent ${centred ? 'origin-center' : 'origin-left'}`}
                initial={reduce ? false : { scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: START + 0.5, ease: EASE }}
            />
        </div>
    );
};
