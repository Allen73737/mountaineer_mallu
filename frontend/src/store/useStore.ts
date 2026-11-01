import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
export type TranslationScope = 'interface' | 'everything';

/** Live conditions at today's featured peak (lib/weather.ts). The extended readings are optional. */
export interface AlpineWeather {
    temp: number | null;
    condition: string;
    isSnowing: boolean;
    code?: number;
    wind?: number;      // km/h
    windDir?: number;   // degrees, meteorological (where the wind comes from)
    cloud?: number;     // %
    visibility?: number; // m
    precip?: number;    // mm
}

interface AppState {
    theme: Theme;
    isSidebarOpen: boolean;
    weather: AlpineWeather;
    weatherLoaded: boolean;
    translationScope: TranslationScope;
    hasSeenWalkthrough: boolean;
    isSnowEffectEnabled: boolean;
    setTheme: (theme: Theme) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setWeather: (weather: AlpineWeather) => void;
    setWeatherLoaded: (loaded: boolean) => void;
    setTranslationScope: (scope: TranslationScope) => void;
    setHasSeenWalkthrough: (seen: boolean) => void;
    toggleSnowEffect: () => void;
    setSnowEffectEnabled: (enabled: boolean) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            theme: 'system',
            isSidebarOpen: false,
            weather: { temp: null, condition: 'Loading...', isSnowing: false },
            weatherLoaded: false,
            translationScope: 'interface',
            hasSeenWalkthrough: false,
            isSnowEffectEnabled: false,
            setTheme: (theme) => set({ theme }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            setWeather: (weather) => set({ weather }),
            setWeatherLoaded: (loaded) => set({ weatherLoaded: loaded }),
            setTranslationScope: (scope) => set({ translationScope: scope }),
            setHasSeenWalkthrough: (seen) => set({ hasSeenWalkthrough: seen }),
            toggleSnowEffect: () => set((state) => ({ isSnowEffectEnabled: !state.isSnowEffectEnabled })),
            setSnowEffectEnabled: (enabled) => set({ isSnowEffectEnabled: enabled }),
        }),
        {
            name: 'mountaineer-mallu-storage', // unique name
            partialize: (state) => ({ 
                theme: state.theme, 
                translationScope: state.translationScope,
                hasSeenWalkthrough: state.hasSeenWalkthrough,
                isSnowEffectEnabled: state.isSnowEffectEnabled,
            }), // only persist these fields
        }
    )
);
