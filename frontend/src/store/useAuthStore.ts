import { create } from 'zustand';
import { authApi, usersApi } from '../lib/api';

export type Role = 'User' | 'Admin' | 'SuperAdmin';

export interface Permissions {
    manageStories: boolean;
    manageEvents: boolean;
    manageGallery: boolean;
    manageCommunity: boolean;
    manageUsers: boolean;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: Role;
    permissions: Permissions;
    isProfileComplete: boolean;
    avatar?: string;
    location?: string;
    phone?: string;
    whatsapp?: string;
}

interface AuthState {
    user: UserProfile | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    checkAuth: () => Promise<void>;
    loginAsync: (email: string, password: string) => Promise<UserProfile>;
    loginWithGoogleAsync: (credential: string) => Promise<UserProfile>;
    signupAsync: (name: string, email: string, password: string, gdprConsent: boolean) => Promise<UserProfile>;
    logoutAsync: () => Promise<void>;
    completeProfile: (data: {
        place: string; city: string; state: string; zip: string;
        phone: string; whatsapp: string;
    }) => Promise<UserProfile>;
    uploadAvatar: (file: File) => Promise<string>;
    updateProfile: (updates: Partial<UserProfile>) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    isLoggedIn: false,
    isLoading: true, // Start as true — we check auth on mount
    error: null,

    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const { user } = await authApi.getMe();
            set({ user, isLoggedIn: true, isLoading: false, error: null });
        } catch {
            set({ user: null, isLoggedIn: false, isLoading: false, error: null });
        }
    },

    loginAsync: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const { user } = await authApi.login({ email, password });
            set({ user, isLoggedIn: true, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
            // Preserve status and data for lockout handling
            const enrichedError: any = new Error(err.message);
            enrichedError.status = err.status;
            enrichedError.data = err.data;
            throw enrichedError;
        }
    },

    loginWithGoogleAsync: async (credential) => {
        try {
            set({ isLoading: true, error: null });
            const { user } = await authApi.googleLogin(credential);
            set({ user, isLoggedIn: true, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
        }
    },

    signupAsync: async (name, email, password, gdprConsent) => {
        try {
            set({ isLoading: true, error: null });
            const { user } = await authApi.signup({ name, email, password, gdprConsent });
            set({ user, isLoggedIn: true, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
        }
    },

    logoutAsync: async () => {
        try {
            await authApi.logout();
        } catch {
            // Logout even if API fails
        }
        set({ user: null, isLoggedIn: false, error: null });
    },

    completeProfile: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const { user } = await usersApi.updateProfile(data);
            set({ user, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
        }
    },

    uploadAvatar: async (file) => {
        try {
            const { avatar, user } = await usersApi.uploadAvatar(file);
            set({ user });
            return avatar;
        } catch (err: any) {
            set({ error: err.message });
            throw err;
        }
    },

    updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
    })),

    clearError: () => set({ error: null }),
}));
