import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { getHeroImageUrl, sceneImages } from '../../data/peaks';

const CREDITS: { role: string; names: string[] }[] = [
    { role: 'A Mountaineer Mallu production', names: [] },
    { role: 'Expedition lead', names: ['Arun Thomas'] },
    { role: 'Alpine safety & high routes', names: ['Rahul Krishnan'] },
    { role: 'Logistics & community', names: ['Sneha Nair'] },
    { role: 'Filmed on location', names: ['Zugspitze', 'Matterhorn', 'Eiger Nordwand', 'Tre Cime di Lavaredo', 'Mont Blanc'] },
    { role: 'Original score', names: ['Wind over the ridge'] },
    { role: 'Starring', names: ['Every member who ever laced their boots before dawn'] },
];

const FINALE = sceneImages.finaleDay;
const NIGHT_FINALE = sceneImages.finaleNight;

/**
 * Closing credits for the footer: as you scroll the last stretch of the page the credit list rolls
 * upward through a soft mask, then a summit still fades up with the motto. Purely decorative —
 * the real footer links stay static and clickable below.
 */
export const EndCredits = () => {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const rollY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['35%', '-35%']);

    return (
        <div className="flex flex-col items-center gap-12 pb-16 border-b border-white/10">
            <div
                ref={ref}
                aria-label="Credits"
                className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]"
            >
                <motion.ul style={{ y: rollY }} className="flex flex-col items-center gap-10 md:gap-14 text-center pt-[8vh]">
                    {CREDITS.map(c => (
                        <li key={c.role} className="flex flex-col items-center gap-2">
                            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-alpine-sunrise/90">{c.role}</span>
                            {c.names.map(n => (
                                <span key={n} className="font-serif text-2xl md:text-4xl text-white/90 max-w-2xl px-4">{n}</span>
                            ))}
                        </li>
                    ))}
                </motion.ul>
            </div>

            {/* Finale */}
            <motion.div
                className="reveal-img [--rev-radius:1rem] relative w-full max-w-5xl aspect-[21/9] rounded-2xl overflow-hidden"
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <img src={getHeroImageUrl(FINALE.src)} alt={FINALE.alt} loading="lazy" decoding="async" className="ken-burns-active dark:hidden absolute inset-0 w-full h-full object-cover" />
                <img src={getHeroImageUrl(NIGHT_FINALE.src)} alt={NIGHT_FINALE.alt} loading="lazy" decoding="async" className="ken-burns-active hidden dark:block absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04101F]/90 via-[#04101F]/30 to-transparent" />
                <motion.p
                    className="absolute inset-x-0 bottom-[14%] text-center whitespace-nowrap font-serif text-[clamp(1.25rem,5vw,3.75rem)] text-white tracking-[0.08em]"
                    initial={reduce ? false : { opacity: 0, letterSpacing: '0.24em', filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.08em', filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 2.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    Ascend · Explore · Belong
                </motion.p>
            </motion.div>
        </div>
    );
};
