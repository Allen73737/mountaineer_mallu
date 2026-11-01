import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { switchTheme } from '../../lib/themeSwitch';

const SPRING = { type: 'spring', stiffness: 260, damping: 22 } as const;

/**
 * Navbar day / night switch. The icon morphs (sun swells into a moon as a shadow slides across it,
 * its rays fold away and stars come out), and the page flips theme with a circular reveal from the button.
 */
export const ThemeToggle = ({ className = '' }: { className?: string }) => {
    const theme = useStore(s => s.theme);
    const setTheme = useStore(s => s.setTheme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                switchTheme(isDark ? 'light' : 'dark', setTheme, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            aria-label={isDark ? 'Switch to day' : 'Switch to night'}
            title={isDark ? 'Day' : 'Night'}
            className={`group relative grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/60 dark:border-white/20 shadow-sm text-alpine-navy dark:text-white transition-colors duration-300 cursor-pointer ${className}`}
        >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="overflow-visible">
                <defs>
                    <mask id="mm-theme-mask">
                        <rect width="24" height="24" fill="#fff" />
                        <motion.circle r="6" fill="#000" initial={false} animate={isDark ? { cx: 17, cy: 7 } : { cx: 30, cy: 0 }} transition={SPRING} />
                    </mask>
                </defs>
                {/* Sun body → moon */}
                <motion.circle
                    cx="12" cy="12" mask="url(#mm-theme-mask)"
                    initial={false}
                    animate={{ r: isDark ? 8 : 4.6, fill: isDark ? '#F0EDE8' : '#E2A071' }}
                    transition={SPRING}
                />
                {/* Rays fold away at night */}
                <motion.g
                    stroke="#E2A071" strokeWidth="1.8" strokeLinecap="round"
                    style={{ transformOrigin: '12px 12px' }}
                    initial={false}
                    animate={{ rotate: isDark ? 45 : 0, scale: isDark ? 0.4 : 1, opacity: isDark ? 0 : 1 }}
                    transition={SPRING}
                >
                    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
                </motion.g>
                {/* Stars come out */}
                <motion.g fill="#A3C9E2" initial={false} animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.3 }} style={{ transformOrigin: '19px 4px' }} transition={{ ...SPRING, delay: isDark ? 0.15 : 0 }}>
                    <circle cx="20.5" cy="3.5" r="0.9" />
                    <circle cx="22" cy="8" r="0.6" />
                </motion.g>
            </svg>
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_24px_rgba(226,160,113,0.45)]" />
        </motion.button>
    );
};
