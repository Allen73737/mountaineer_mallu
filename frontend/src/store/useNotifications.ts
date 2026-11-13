import { create } from 'zustand';
import { toast } from 'sonner';
import { notificationsApi, type AppNotification } from '../lib/api';
import { useSiteSettings } from './useSiteSettings';
import { useAuthStore } from './useAuthStore';

interface NotificationsState {
    items: AppNotification[];
    unread: number;
    loaded: boolean;
    load: () => Promise<void>;
    markRead: (id: string) => void;
    markAllRead: () => void;
    clear: () => void;
    reset: () => void;
    push: (n: AppNotification) => void;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
    items: [],
    unread: 0,
    loaded: false,

    load: async () => {
        try {
            const { notifications, unread } = await notificationsApi.list();
            set({ items: notifications, unread, loaded: true });
        } catch {
            set({ loaded: true });
        }
    },

    push: (n) => {
        if (get().items.some(i => i._id === n._id)) return;
        set(s => ({ items: [n, ...s.items].slice(0, 50), unread: s.unread + (n.read ? 0 : 1) }));
    },

    markRead: (id) => {
        const target = get().items.find(i => i._id === id);
        if (!target || target.read) return;
        set(s => ({ items: s.items.map(i => (i._id === id ? { ...i, read: true } : i)), unread: Math.max(0, s.unread - 1) }));
        notificationsApi.markRead(id).catch(() => {});
    },

    markAllRead: () => {
        if (!get().unread) return;
        set(s => ({ items: s.items.map(i => ({ ...i, read: true })), unread: 0 }));
        notificationsApi.markAllRead().catch(() => {});
    },

    clear: () => {
        set({ items: [], unread: 0 });
        notificationsApi.clear().catch(() => {});
    },

    reset: () => set({ items: [], unread: 0, loaded: false }),
}));

/**
 * Keeps notifications in sync with the signed-in user: loads the inbox, re-handshakes the socket
 * after login/logout so the server puts it in the right private room, and listens for live pushes.
 * Call once near the app root.
 */
export const startNotificationSync = () => {
    let currentUserId: string | null = null;
    let detachSocket: (() => void) | null = null;

    const attach = () => {
        detachSocket?.();
        const socket = useSiteSettings.getState().socket;
        if (!socket) return;
        const onNotification = (n: AppNotification) => {
            useNotifications.getState().push(n);
            toast(n.title, { description: n.body || undefined, action: n.link ? { label: 'Open', onClick: () => { window.location.assign(n.link!); } } : undefined });
        };
        socket.on('notification', onNotification);
        detachSocket = () => socket.off('notification', onNotification);
    };

    const sync = () => {
        const user = useAuthStore.getState().user;
        const id = user?.id ?? null;
        if (id === currentUserId) return;
        currentUserId = id;

        const socket = useSiteSettings.getState().socket;
        // The server reads the session cookie only during the handshake, so reconnect on identity change
        if (socket?.connected) { socket.disconnect(); socket.connect(); }

        if (id) {
            useNotifications.getState().load();
        } else {
            useNotifications.getState().reset();
        }
    };

    const unsubAuth = useAuthStore.subscribe(sync);
    const unsubSocket = useSiteSettings.subscribe((s, prev) => { if (s.socket !== prev.socket) attach(); });
    attach();
    sync();

    return () => { unsubAuth(); unsubSocket(); detachSocket?.(); };
};
