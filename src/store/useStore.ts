import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
    theme: Theme;
    isSidebarOpen: boolean;
    weather: {
        temp: number | null;
        condition: string;
        isSnowing: boolean;
    };
    weatherLoaded: boolean;
    setTheme: (theme: Theme) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setWeather: (weather: { temp: number | null; condition: string; isSnowing: boolean }) => void;
    setWeatherLoaded: (loaded: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    theme: 'system',
    isSidebarOpen: false,
    weather: { temp: null, condition: 'Loading...', isSnowing: false },
    weatherLoaded: false,
    setTheme: (theme) => set({ theme }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setWeather: (weather) => set({ weather }),
    setWeatherLoaded: (loaded) => set({ weatherLoaded: loaded }),
}));
