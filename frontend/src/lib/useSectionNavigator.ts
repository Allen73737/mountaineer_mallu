import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type Lenis from 'lenis';
import { useLenis } from '../components/ui/SmoothScrollProvider';

/** Clearance for the fixed navbar when landing on a section. */
export const SECTION_SCROLL_OFFSET = -88;

/**
 * Smooth-scroll to a section id. Sections use `content-visibility: auto`, so their
 * real heights resolve as they render; the scroll is re-aimed once on arrival if the
 * target moved while we were travelling.
 */
export const scrollToSectionId = (id: string, lenis: Lenis | null, immediate = false) => {
    const el = document.getElementById(id);
    if (!el) return false;

    // Lenis clamps to a cached page height that refreshes on a debounced observer. Right after a
    // route swap that cache can be stale (even ~0), so refresh it synchronously before every aim.
    let corrections = 0;
    const settle = () => {
        lenis?.resize();
        const drift = el.getBoundingClientRect().top + SECTION_SCROLL_OFFSET;
        if (Math.abs(drift) <= 6 || corrections++ >= 3) return;
        if (lenis) lenis.scrollTo(el, { offset: SECTION_SCROLL_OFFSET, duration: 0.6, onComplete: settle });
        else { window.scrollBy({ top: drift, behavior: 'smooth' }); setTimeout(settle, 700); }
    };

    lenis?.resize();
    if (lenis) {
        lenis.scrollTo(el, { offset: SECTION_SCROLL_OFFSET, duration: immediate ? 0 : 1.3, immediate, onComplete: settle });
    } else {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + SECTION_SCROLL_OFFSET, behavior: immediate ? 'auto' : 'smooth' });
        setTimeout(settle, immediate ? 50 : 900);
    }
    return true;
};

/**
 * Returns a handler for in-page section links (#mission, #stories …).
 * On the home page it smooth-scrolls; elsewhere it client-side navigates to `/#id`
 * (no full page reload) and the router's scroll manager takes it from there.
 */
export const useSectionNavigator = () => {
    const { lenis } = useLenis();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return useCallback((id: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        if (pathname !== '/') {
            navigate(`/#${id}`);
            return;
        }
        if (scrollToSectionId(id, lenis)) {
            window.history.replaceState(null, '', `#${id}`);
        }
    }, [lenis, navigate, pathname]);
};
