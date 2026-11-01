import { create } from 'zustand';

export interface MorphRect { x: number; y: number; width: number; height: number }

interface MorphState {
    /** Set while a card image is flying to the next page; RouteTransition skips its veil for that navigation. */
    active: { src: string; rect: MorphRect; id: number } | null;
    /** The destination's hero image has painted — the flying copy can fade out. */
    landed: boolean;
    start: (src: string, rect: MorphRect) => void;
    land: () => void;
    clear: () => void;
}

export const useMorph = create<MorphState>(set => ({
    active: null,
    landed: false,
    start: (src, rect) => set({ active: { src, rect, id: Date.now() }, landed: false }),
    land: () => set(s => (s.active ? { landed: true } : s)),
    clear: () => set({ active: null, landed: false }),
}));

/** Call from a detail page's hero <img onLoad>: tells an in-flight morph that the real image is ready. */
export const landMorph = () => useMorph.getState().land();
