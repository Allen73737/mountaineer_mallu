import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CookieConsentState {
    hasConsented: boolean;
    acknowledge: () => void;
}

export const useCookieConsent = create<CookieConsentState>()(
    persist(
        (set) => ({
            hasConsented: false,
            acknowledge: () => set({ hasConsented: true }),
        }),
        {
            name: 'mm-cookie-consent', // name of the item in the storage (must be unique)
        }
    )
);
