import React from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { useMorph } from '../../lib/morph';

/**
 * A Link whose card image grows into the next page's hero instead of the usual veil.
 * The image is the closest `[data-morph-card]` ancestor's `img[data-morph-img]` (or its first <img>).
 * Modified clicks (new tab etc.), reduced motion and cards without a loaded image fall back to a plain Link.
 */
export const MorphLink: React.FC<LinkProps> = ({ onClick, to, ...rest }) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const card = e.currentTarget.closest('[data-morph-card]');
        const img = card?.querySelector<HTMLImageElement>('img[data-morph-img]') ?? card?.querySelector<HTMLImageElement>('img');
        if (!img || !img.complete || !img.naturalWidth) return;
        const r = img.getBoundingClientRect();
        if (r.width < 40 || r.height < 40) return;
        e.preventDefault();
        useMorph.getState().start(img.currentSrc || img.src, { x: r.left, y: r.top, width: r.width, height: r.height });
        navigate(to);
    };

    return <Link to={to} onClick={handleClick} {...rest} />;
};
