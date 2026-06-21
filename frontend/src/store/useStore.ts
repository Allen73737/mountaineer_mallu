import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
export type TranslationScope = 'interface' | 'everything';

interface AppState {
    theme: Theme;
    isSidebarOpen: boolean;
    weather: {
        temp: number | null;
        condition: string;
        isSnowing: boolean;
    };
    weatherLoaded: boolean;
    translationScope: TranslationScope;
    hasSeenWalkthrough: boolean;
    setTheme: (theme: Theme) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setWeather: (weather: { temp: number | null; condition: string; isSnowing: boolean }) => void;
    setWeatherLoaded: (loaded: boolean) => void;
    setTranslationScope: (scope: TranslationScope) => void;
    setHasSeenWalkthrough: (seen: boolean) => void;
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
            setTheme: (theme) => set({ theme }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            setWeather: (weather) => set({ weather }),
            setWeatherLoaded: (loaded) => set({ weatherLoaded: loaded }),
            setTranslationScope: (scope) => set({ translationScope: scope }),
            setHasSeenWalkthrough: (seen) => set({ hasSeenWalkthrough: seen }),
        }),
        {
            name: 'mountaineer-mallu-storage', // unique name
            partialize: (state) => ({ 
                theme: state.theme, 
                translationScope: state.translationScope,
                hasSeenWalkthrough: state.hasSeenWalkthrough
            }), // only persist these fields
        }
    )
);
