import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { settingsApi } from '../lib/api';
import { API_URL } from '../lib/constants';

export type SectionStatus = 'visible' | 'hidden' | 'coming_soon';

export interface SiteSettings {
    sections: Record<string, SectionStatus>;
    maintenance: {
        enabled: boolean;
        message: string;
        allowAdminAccess: boolean;
    };
}

interface SiteSettingsStore {
    settings: SiteSettings;
    loaded: boolean;
    socket: Socket | null;
    fetchSettings: () => Promise<void>;
    initSocket: () => void;
    disconnectSocket: () => void;
    isVisible: (section: string) => boolean;
    isComingSoon: (section: string) => boolean;
    isHidden: (section: string) => boolean;
}

const defaultSettings: SiteSettings = {
    sections: {
        stories: 'visible',
        events: 'visible',
        gallery: 'visible',
        community: 'visible',
        shop: 'coming_soon',
        reviews: 'visible',
        team: 'visible',
        contact: 'visible',
    },
    maintenance: {
        enabled: false,
        message: '',
        allowAdminAccess: true,
    },
};

export const useSiteSettings = create<SiteSettingsStore>((set, get) => ({
    settings: defaultSettings,
    loaded: false,
    socket: null,

    fetchSettings: async () => {
        try {
            const data = await settingsApi.get();
            set({ settings: data.settings as SiteSettings, loaded: true });
        } catch (err) {
            console.warn('Failed to fetch site settings, using defaults:', err);
            set({ loaded: true });
        }
    },

    initSocket: () => {
        if (get().socket) return; // already connected

        const socket = io(API_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 10,
        });

        socket.on('settings:updated', (newSettings: Partial<SiteSettings>) => {
            set((state) => ({
                settings: {
                    ...state.settings,
                    ...newSettings,
                },
            }));
        });

        socket.on('connect', () => {
            console.log('🔌 Real-time connected');
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    isVisible: (section: string) => {
        return get().settings.sections[section] === 'visible';
    },

    isComingSoon: (section: string) => {
        return get().settings.sections[section] === 'coming_soon';
    },

    isHidden: (section: string) => {
        return get().settings.sections[section] === 'hidden';
    },
}));
