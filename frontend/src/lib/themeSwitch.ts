import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark' | 'system';

const resolve = (t: Theme) => (t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t);

/**
 * Switch theme with a light-leak reveal: the new theme opens as a circle from the point that was clicked
 * (View Transitions API), the way premium sites flip day ↔ night. Browsers without the API, and visitors
 * who prefer reduced motion, get the instant switch.
 */
export const switchTheme = (next: Theme, setTheme: (t: Theme) => void, origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const target = resolve(next);
    const apply = () => {
        // Apply the class ourselves inside the transition callback so the "after" snapshot is the new theme
        root.classList.remove('light', 'dark');
        root.classList.add(target);
        setTheme(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || root.classList.contains(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        apply();
        return;
    }
    const x = origin?.x ?? window.innerWidth - 80;
    const y = origin?.y ?? 40;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add('theme-vt');
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready.then(() => {
        const anim = root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 950, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
        );
        anim.finished.finally(() => root.classList.remove('theme-vt'));
    }).catch(() => root.classList.remove('theme-vt'));
};
