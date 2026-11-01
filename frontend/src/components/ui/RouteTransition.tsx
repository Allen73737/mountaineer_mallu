import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useLenis } from './SmoothScrollProvider';
import { scrollToSectionId } from '../../lib/useSectionNavigator';
import { readScroll, saveScroll, scrollToWhenReady } from '../../lib/scrollMemory';
import { useIntro } from '../../lib/intro';
import { useMorph } from '../../lib/morph';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;
const VEIL_S = 1.35;

// Destination name shown on the veil while the scene changes
const ROUTE_TITLES: Record<string, [string, string]> = {
    '/': ['Base camp', 'Home'],
    '/stories': ['The Chronicles', 'Stories'],
    '/events': ['Expeditions', 'Events'],
    '/gallery': ['Visual Vault', 'Gallery'],
    '/community': ['Community', 'Together'],
    '/team': ['Our team', 'The crew'],
    '/reviews': ['The Legacy', 'Reviews'],
    '/shop': ['Provisions', 'Shop'],
    '/contact': ['Mission Control', 'Contact'],
    '/auth': ['Welcome back', 'Account'],
    '/dashboard': ['Your basecamp', 'Dashboard'],
};
const titleFor = (key: string): [string, string] => {
    if (ROUTE_TITLES[key]) return ROUTE_TITLES[key];
    const base = '/' + key.split('/')[1];
    if (ROUTE_TITLES[base]) return [ROUTE_TITLES[base][0], 'Detail'];
    return ['Mountaineer Mallu', 'Ascend'];
};

// Leading / trailing edges: a mountain ridge while moving, flat at rest (same commands so `d` tweens).
// The trailing edge is the ridge reflected, like the range mirrored in a lake.
const RIDGE_X = [0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100];
const RIDGE_Y = [70, 52, 60, 30, 46, 12, 38, 24, 50, 40, 62, 55, 74];
const ridge = (ys: number[], base: number) => `M0 ${base} ${RIDGE_X.map((x, i) => `L${x} ${ys[i]}`).join(' ')} L100 ${base} Z`;
const EDGE_TOP = { curved: ridge(RIDGE_Y, 100), flat: ridge(RIDGE_Y.map(() => 100), 100) };
const EDGE_BOTTOM = { curved: ridge(RIDGE_Y.map(y => 100 - y), 0), flat: ridge(RIDGE_Y.map(() => 0), 0) };

// Topographic contours printed on the veil; they survey themselves in while the destination name holds
const VEIL_CONTOURS = Array.from({ length: 8 }, (_, k) => {
    const base = 60 + k * 62;
    const pts = Array.from({ length: 73 }, (_, j) => {
        const t = (j / 72) * Math.PI * 2;
        const r = base * (1 + 0.14 * Math.sin(3 * t + k * 0.5) + 0.08 * Math.sin(5 * t - k * 0.9) + 0.04 * Math.sin(8 * t + k));
        return `${(720 + Math.cos(t) * r * 1.4).toFixed(1)} ${(450 + Math.sin(t) * r * 0.9).toFixed(1)}`;
    });
    return `M${pts.join(' L')} Z`;
});

/**
 * Page transitions keyed by route. A navy veil with curved edges rises over the old page while the
 * destination's name settles in its centre, holds for a beat, then lifts away (trailing edge bending)
 * as the new page rises underneath. The page swap happens while the veil covers the screen.
 *
 * Scroll memory: positions are saved per history entry. Back / forward and refreshes return to where
 * the visitor was (restored under the veil or the intro loader); new navigations start at the top.
 */
export const RouteTransition: React.FC<{ routeKey: string; children: React.ReactNode }> = ({ routeKey, children }) => {
    const { lenis } = useLenis();
    const location = useLocation();
    const navType = useNavigationType();
    const introDone = useIntro(s => s.introDone);
    const { hash, pathname, key } = location;
    const hashRef = useRef(hash);
    hashRef.current = hash;
    const navRef = useRef({ navType, key });
    navRef.current = { navType, key };
    // The entry whose page is actually on screen (lags `key` until the old page has left)
    const shownKeyRef = useRef(key);

    const scrollNow = useCallback((y: number) => {
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
    }, [lenis]);

    // Take over from the browser, which would otherwise restore too early (before lazy content exists)
    useEffect(() => {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    }, []);

    // Save the visible entry's position as the visitor scrolls (throttled) and when the page is hidden
    useEffect(() => {
        // Storage writes are synchronous: at most every 250 ms while scrolling (plus on hide), not every frame
        let timer = 0;
        const save = () => { timer = 0; saveScroll(shownKeyRef.current, window.scrollY); };
        const onScroll = () => { if (!timer) timer = window.setTimeout(save, 250); };
        const onHide = () => saveScroll(shownKeyRef.current, window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pagehide', onHide);
        return () => {
            if (timer) window.clearTimeout(timer);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('pagehide', onHide);
        };
    }, []);

    // Refresh / reopened tab: return to the saved spot as the intro curtain lifts
    const restoredInitial = useRef(false);
    useEffect(() => {
        if (restoredInitial.current || !introDone || hashRef.current) return;
        restoredInitial.current = true;
        const y = readScroll(key);
        if (y) return scrollToWhenReady(y, scrollNow);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [introDone]);

    // Sub-routes sharing one key (admin panel tabs) don't exit/enter — handle scroll directly
    const prev = useRef({ routeKey, pathname });
    useEffect(() => {
        const was = prev.current;
        prev.current = { routeKey, pathname };
        if (was.routeKey === routeKey && was.pathname !== pathname) {
            shownKeyRef.current = key;
            const y = navType === 'POP' ? readScroll(key) : null;
            if (y) scrollToWhenReady(y, scrollNow); else scrollNow(0);
        }
    }, [routeKey, pathname, key, navType, scrollNow]);

    const restoreScroll = useCallback(() => {
        const { navType: nt, key: k } = navRef.current;
        shownKeyRef.current = k;
        const target = hashRef.current ? decodeURIComponent(hashRef.current.slice(1)) : '';
        if (target) {
            // The section may still be mounting (lazy route / content-visibility); retry briefly
            let tries = 0;
            const attempt = () => {
                if (scrollToSectionId(target, lenis) || ++tries > 20) return;
                setTimeout(attempt, 100);
            };
            requestAnimationFrame(attempt);
            return;
        }
        const y = nt === 'POP' ? readScroll(k) : null;
        if (y) scrollToWhenReady(y, scrollNow);
        else scrollNow(0);
    }, [lenis, scrollNow]);

    // Deep link straight to /#section on first load (no exit happens on the first render)
    useEffect(() => {
        if (!hashRef.current) return;
        const t = setTimeout(restoreScroll, 150);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [title, kicker] = titleFor(routeKey);

    // A card-to-page morph (MorphLink) replaces the veil for that one navigation. Decided once per route
    // change, so the veil can't pop in later when the morph finishes.
    const veilSkip = useRef<{ key: string; skip: boolean }>({ key: routeKey, skip: false });
    if (veilSkip.current.key !== routeKey) veilSkip.current = { key: routeKey, skip: useMorph.getState().active !== null };
    const showVeil = !veilSkip.current.skip;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    key={`progress-${routeKey}`}
                    className="route-progress"
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ scaleX: { duration: 0.9, ease: EASE_OUT_EXPO }, opacity: { duration: 0.35, delay: 0.8 } }}
                    aria-hidden="true"
                />
            </AnimatePresence>

            {/* Scene change veil. Skipped on first load (initial={false}) — the intro loader covers that. */}
            <AnimatePresence initial={false}>
                {showVeil && <motion.div
                    key={`veil-${routeKey}`}
                    className="route-veil"
                    initial={{ y: '140%' }}
                    // Parked 140% away so the 22vh ridge edges never hang into the window at rest
                    animate={{ y: ['140%', '0%', '0%', '-140%'] }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: VEIL_S, times: [0, 0.34, 0.52, 1], ease: EASE_IN_OUT_QUART }}
                    aria-hidden="true"
                >
                    <svg className="route-veil__topo" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                        {VEIL_CONTOURS.map((d, i) => (
                            <motion.path
                                key={i}
                                d={d}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: VEIL_S, times: [0, 0.2 + i * 0.015, 0.62, 0.85], ease: EASE_OUT_EXPO }}
                                strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
                            />
                        ))}
                    </svg>
                    <svg className="route-veil__edge route-veil__edge--top" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path initial={{ d: EDGE_TOP.curved }} animate={{ d: [EDGE_TOP.curved, EDGE_TOP.flat, EDGE_TOP.flat] }} transition={{ duration: VEIL_S, times: [0, 0.34, 1], ease: EASE_IN_OUT_QUART }} />
                    </svg>
                    <svg className="route-veil__edge route-veil__edge--bottom" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path initial={{ d: EDGE_BOTTOM.flat }} animate={{ d: [EDGE_BOTTOM.flat, EDGE_BOTTOM.flat, EDGE_BOTTOM.curved] }} transition={{ duration: VEIL_S, times: [0, 0.52, 1], ease: EASE_IN_OUT_QUART }} />
                    </svg>

                    <div className="route-veil__content">
                        <motion.span
                            className="route-veil__kicker"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                            transition={{ duration: VEIL_S, times: [0.15, 0.36, 0.55, 0.72] }}
                        >
                            <span className="route-veil__dot" /> {kicker}
                        </motion.span>
                        <span className="route-veil__mask">
                            <motion.span
                                className="route-veil__title"
                                initial={{ y: '110%' }}
                                animate={{ y: ['110%', '0%', '0%', '-110%'] }}
                                transition={{ duration: VEIL_S, times: [0.12, 0.38, 0.55, 0.78], ease: EASE_IN_OUT_QUART }}
                            >
                                {title}
                            </motion.span>
                        </span>
                        <motion.span
                            className="route-veil__rule"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
                            transition={{ duration: VEIL_S, times: [0.2, 0.5, 0.7], ease: EASE_OUT_EXPO }}
                        />
                    </div>
                </motion.div>}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false} onExitComplete={restoreScroll}>
                <motion.div
                    key={routeKey}
                    initial={{ opacity: 0, y: 60, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 1.1, delay: 0.62, ease: EASE_OUT_EXPO } }}
                    exit={{ opacity: 0, y: -24, scale: 0.99, transition: { duration: 0.42, ease: EASE_IN } }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

/** Collapse nested routes that share a shell (admin, auth) into one key so the shell doesn't replay. */
export const getRouteKey = (pathname: string) => {
    if (pathname.startsWith('/summit-control-panel')) return '/summit-control-panel';
    if (pathname === '/login' || pathname === '/signup') return '/auth';
    return pathname;
};
