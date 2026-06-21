import { create } from 'zustand';

interface ThemePalette {
    primary: string;
    glow: string;
    accent: string;
    bgGradientFrom: string;
    bgGradientTo: string;
    mood: string;
}

interface AdaptiveThemeState {
    theme: ThemePalette | null;
    isLoading: boolean;
    setTheme: (theme: ThemePalette) => void;
    setLoading: (isLoading: boolean) => void;
    clearTheme: () => void;
}

export const useAdaptiveTheme = create<AdaptiveThemeState>((set) => ({
    theme: null,
    isLoading: false,
    setTheme: (theme) => set({ theme }),
    setLoading: (isLoading) => set({ isLoading }),
    clearTheme: () => set({ theme: null })
}));
