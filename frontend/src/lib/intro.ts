import { create } from 'zustand';

interface LogoHandoffSource {
    rect: { x: number; y: number; width: number; height: number };
    src: string;
}

interface IntroState {
    /** True once the first-visit loader has lifted (or immediately when there is no loader). Hero reveals wait on it. */
    introDone: boolean;
    /** Where the loader's logo was when it started to exit — <LogoHandoff /> flies a copy from here to the navbar. */
    logoFrom: LogoHandoffSource | null;
    finishIntro: (logoFrom?: LogoHandoffSource | null) => void;
}

export const useIntro = create<IntroState>(set => ({
    introDone: false,
    logoFrom: null,
    finishIntro: (logoFrom = null) => set({ introDone: true, logoFrom }),
}));

/** Split into user-perceived characters so Malayalam conjuncts and emoji stay intact when animated per letter. */
export const splitGraphemes = (text: string): string[] => {
    const Segmenter = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
    if (Segmenter) return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(text), s => s.segment);
    return Array.from(text);
};
