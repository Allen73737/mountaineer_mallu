import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    login: (user: UserProfile) => void;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updatePermissions: (userId: string, newPermissions: Permissions) => void;
    updateRole: (userId: string, newRole: Role) => void;
}

// Initial mock state for different roles
export const mockSuperAdmin: UserProfile = {
    id: '1',
    name: 'Alex Explorer',
    email: 'alex@mountaineermallu.com',
    role: 'SuperAdmin',
    isProfileComplete: true,
    permissions: {
        manageStories: true,
        manageEvents: true,
        manageGallery: true,
        manageCommunity: true,
        manageUsers: true,
    }
};

export const mockAdmin: UserProfile = {
    id: '2',
    name: 'Sarah Summit',
    email: 'sarah@mountaineermallu.com',
    role: 'Admin',
    isProfileComplete: true,
    permissions: {
        manageStories: true,
        manageEvents: true,
        manageGallery: false,
        manageCommunity: false,
        manageUsers: false,
    }
};

export const mockUser: UserProfile = {
    id: '3',
    name: 'John Hiker',
    email: 'john@mountaineermallu.com',
    role: 'User',
    isProfileComplete: false, // Initially false to trigger completion page
    permissions: {
        manageStories: false,
        manageEvents: false,
        manageGallery: false,
        manageCommunity: false,
        manageUsers: false,
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            login: (user) => set({ user, isLoggedIn: true }),
            logout: () => set({ user: null, isLoggedIn: false }),
            updateProfile: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
            updatePermissions: (userId, newPermissions) => set((state) => {
                // In a real app, this would mutate a user list on the backend.
                // Since this is mock, if the logged-in user is the one being updated, update them locally.
                if (state.user && state.user.id === userId) {
                    return { user: { ...state.user, permissions: newPermissions } };
                }
                return {};
            }),
            updateRole: (userId, newRole) => set((state) => {
                // Same logic as updatePermissions
                if (state.user && state.user.id === userId) {
                    return { user: { ...state.user, role: newRole } };
                }
                return {};
            })
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // using sessionStorage for persistence across reloads during a session
        }
    )
);
