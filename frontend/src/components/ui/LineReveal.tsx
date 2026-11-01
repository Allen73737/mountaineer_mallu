import React, { Children, isValidElement, useLayoutEffect, useRef } from 'react';

type Token = { key: string; node: React.ReactNode } | { key: string; br: true };

/** Words of plain strings become separate tokens; elements (italic spans, gradients) stay whole; <br> passes through. */
const tokenize = (children: React.ReactNode): Token[] => {
    const tokens: Token[] = [];
    Children.toArray(children).forEach((child, ci) => {
        if (typeof child === 'string' || typeof child === 'number') {
            String(child).split(/\s+/).filter(Boolean).forEach((word, wi) => tokens.push({ key: `${ci}-${wi}`, node: word }));
        } else if (isValidElement(child) && child.type === 'br') {
            tokens.push({ key: `${ci}-br`, br: true });
        } else {
            tokens.push({ key: `${ci}-el`, node: child });
        }
    });
    return tokens;
};

/**
 * Masked line reveal for headings. Put it inside an element that has `cine-title has-lines`:
 *   <h2 className="cine-title has-lines …"><LineReveal>{title}</LineReveal></h2>
 * Every word sits in its own mask; after layout each word is tagged with the index of the line it
 * wrapped onto (--line), and the CSS in index.css raises the lines one after another as the heading's
 * --cine scroll progress climbs. Re-measured when the heading reflows.
 */
export const LineReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const anchorRef = useRef<HTMLSpanElement>(null);
    const tokens = tokenize(children);
    // Re-measure only when the words change, not on every parent render
    const signature = tokens.map(t => ('br' in t ? '<br>' : typeof t.node === 'string' ? t.node : t.key)).join(' ');

    useLayoutEffect(() => {
        const heading = anchorRef.current?.parentElement;
        if (!heading) return;
        const assign = () => {
            const words = heading.querySelectorAll<HTMLElement>(':scope > .lr-word');
            let line = -1;
            let lastTop = -Infinity;
            words.forEach(word => {
                const top = word.offsetTop;
                if (top > lastTop + 2) { line++; lastTop = top; }
                word.style.setProperty('--line', String(line));
            });
        };
        assign();
        const ro = new ResizeObserver(assign);
        ro.observe(heading);
        // Web fonts change word widths (and so the wrapping) once they arrive
        document.fonts?.ready.then(assign).catch(() => {});
        return () => ro.disconnect();
    }, [signature]);

    return (
        <>
            <span ref={anchorRef} hidden />
            {tokens.map((token, i) => (
                'br' in token ? <br key={token.key} /> : (
                    <React.Fragment key={token.key}>
                        <span className="lr-word"><span>{token.node}</span></span>
                        {i < tokens.length - 1 && !('br' in tokens[i + 1]) ? ' ' : null}
                    </React.Fragment>
                )
            ))}
        </>
    );
};
