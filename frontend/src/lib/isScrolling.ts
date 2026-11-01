/**
 * True while the page is scrolling (SmoothScrollProvider sets body.is-scrolling, cleared ~100 ms after
 * the last scroll frame). Hover handlers use it to ignore cards sliding under a resting cursor, which
 * would otherwise kick off layout animations mid-scroll.
 */
export const isPageScrolling = () => typeof document !== 'undefined' && document.body.classList.contains('is-scrolling');
