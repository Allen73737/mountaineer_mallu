import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { settingsApi } from '../lib/api';
import { API_URL } from '../lib/constants';

export type SectionStatus = 'visible' | 'hidden' | 'coming_soon';
export type SectionBgTheme = 'alpine_blue' | 'pitch_black' | 'white';

export interface SectionConfig {
    status: SectionStatus;
    bgTheme: SectionBgTheme;
}

export interface SiteSettings {
    sections: Record<string, SectionConfig>;
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
        stories: { status: 'visible', bgTheme: 'white' },
        events: { status: 'visible', bgTheme: 'white' },
        gallery: { status: 'visible', bgTheme: 'white' },
        community: { status: 'visible', bgTheme: 'white' },
        shop: { status: 'coming_soon', bgTheme: 'white' },
        reviews: { status: 'visible', bgTheme: 'white' },
        team: { status: 'visible', bgTheme: 'white' },
        contact: { status: 'visible', bgTheme: 'white' },
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
            const settingsData = data.settings;
            // Handle backwards compatibility (strings to objects)
            const migratedSections: Record<string, SectionConfig> = {};
            for (const [key, val] of Object.entries(settingsData.sections || {})) {
                if (typeof val === 'string') {
                    migratedSections[key] = { status: val as SectionStatus, bgTheme: 'white' };
                } else {
                    migratedSections[key] = val as SectionConfig;
                }
            }
            settingsData.sections = migratedSections;
            set({ settings: settingsData as SiteSettings, loaded: true });
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
        return get().settings.sections[section]?.status === 'visible';
    },

    isComingSoon: (section: string) => {
        return get().settings.sections[section]?.status === 'coming_soon';
    },

    isHidden: (section: string) => {
        return get().settings.sections[section]?.status === 'hidden';
    },
}));
