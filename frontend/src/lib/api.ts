import { API_URL } from './constants';

// ─── Base Fetch Wrapper ────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
    params?: Record<string, string | number>;
    retries?: number;
    timeoutMs?: number;
}

// Global auth invalidation callback
let onAuthInvalidated: (() => void) | null = null;
export const setAuthInvalidatedCallback = (cb: () => void) => { onAuthInvalidated = cb; };

// Global demo user flag for interceptor
let isDemoMode = false;
export const setDemoMode = (demo: boolean) => { isDemoMode = demo; };

// Server reachability, broadcast so the UI can show one calm banner instead of a wall of errors
let serverReachable = true;
const markServerReachable = (ok: boolean) => {
    if (ok === serverReachable) return;
    serverReachable = ok;
    window.dispatchEvent(new CustomEvent('mm:server-status', { detail: { reachable: ok } }));
};
export const isServerReachable = () => serverReachable;

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, retries = 0, timeoutMs, ...fetchOptions } = options;

    let url = `${API_URL}/api${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    // Adaptive timeout based on workload
    const isAiRequest = endpoint.startsWith('/ai');
    const isUploadRequest = fetchOptions.body instanceof FormData || endpoint.includes('upload');
    const effectiveTimeout = timeoutMs ?? (isUploadRequest ? 60000 : (isAiRequest ? 45000 : 10000));

    const timeoutSignal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? AbortSignal.timeout(effectiveTimeout)
        : undefined;

    const config: RequestInit = {
        credentials: 'include',
        signal: fetchOptions.signal || timeoutSignal,
        headers: {
            ...(!(fetchOptions.body instanceof FormData) && { 'Content-Type': 'application/json' }),
            ...fetchOptions.headers,
        },
        ...fetchOptions,
    };

    // Pre-emptively block mutating requests from the frontend if in demo mode
    const method = config.method ? config.method.toUpperCase() : 'GET';
    const demoAllowed = endpoint === '/auth/logout' || endpoint.startsWith('/notifications') || endpoint === '/ai/theme-suggestion' || endpoint === '/ai/route-briefing';
    if (isDemoMode && method !== 'GET' && !demoAllowed) {
        const error: any = new Error('Action not permitted for demo accounts.');
        error.status = 403;
        error.data = { error: 'Action not permitted for demo accounts.' };
        return Promise.reject(error);
    }

    try {
        const response = await fetch(url, config);

        // Auto-logout on 401 (expired session), but not for auth endpoints
        if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/signup') && endpoint !== '/auth/me') {
            onAuthInvalidated?.();
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
            const error: any = new Error(errorData.error || `Request failed with status ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        markServerReachable(true);
        return response.json();
    } catch (error: any) {
        // Fast-fail on auth check or initial settings to avoid blocking initial render
        const isTransientNetworkError = !error.status || error.status === 503 || error.status === 504;
        // Only reads are retried: repeating a POST (login, post, register) could perform it twice
        const maxRetries = isUploadRequest || method !== 'GET' ? 0 : 2;

        if (isTransientNetworkError && retries < maxRetries && endpoint !== '/auth/me' && endpoint !== '/settings') {
            const backoff = Math.min(300 * Math.pow(2, retries), 1500);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return request<T>(endpoint, { ...options, retries: retries + 1 });
        }

        // fetch() rejects with a TypeError when nothing answers (server down, offline, CORS) — say so plainly
        if (!error.status && error.name !== 'AbortError' && error.name !== 'TimeoutError') {
            markServerReachable(false);
            const friendly: any = new Error(import.meta.env.DEV
                ? `Can't reach the API at ${API_URL || window.location.origin}. Is the backend running? (npm run dev in the project root)`
                : "We can't reach our servers right now. Check your connection and try again.");
            friendly.status = 0;
            friendly.cause = error;
            throw friendly;
        }
        if (error.name === 'TimeoutError') {
            const slow: any = new Error('The server took too long to answer. Please try again.');
            slow.status = 0;
            throw slow;
        }
        throw error;
    }
}

// ─── Auth API ──────────────────────────────────────────────────────────

export const authApi = {
    signup: (data: { name: string; email: string; password: string; gdprConsent: boolean }) =>
        request<{ user: any; message: string }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        request<{ user: any; message: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    demoLogin: () =>
        request<{ user: any; message: string }>('/auth/demo-login', {
            method: 'POST',
        }),

    logout: () =>
        request<{ message: string }>('/auth/logout', { method: 'POST' }),

    getMe: () =>
        request<{ user: any }>('/auth/me'),

    googleLogin: (credential: string) =>
        request<{ user: any; message: string }>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        }),

    checkUsername: (name: string) =>
        request<{ available: boolean; message: string }>(`/auth/check-username/${encodeURIComponent(name)}`),

    forgotPassword: (email: string) =>
        request<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    verifyOtp: (data: { email: string; otp: string }) =>
        request<{ message: string; resetToken: string }>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
        request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── Users API ─────────────────────────────────────────────────────────

export const usersApi = {
    updateProfile: (data: any) =>
        request<{ user: any; message: string }>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    changePassword: (data: any) =>
        request<{ message: string }>('/users/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return request<{ user: any; avatar: string }>('/users/avatar', {
            method: 'PUT',
            body: formData,
        });
    },

    getMyProfile: () => request<{ user: any }>('/users/me'),

    createCollection: (name: string) =>
        request<{ message: string; collections: any[] }>('/users/collections', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    addToCollection: (collectionId: string, itemId: string) =>
        request<{ message: string; collections: any[] }>(`/users/collections/${collectionId}/items`, {
            method: 'POST',
            body: JSON.stringify({ itemId }),
        }),

    trackDownload: (itemId: string) =>
        request<{ message: string; downloads: any[] }>('/users/downloads', {
            method: 'POST',
            body: JSON.stringify({ itemId }),
        }),

    getMyExpeditions: () =>
        request<{ expeditions: any[] }>('/users/me/expeditions'),

    toggleExpeditionReminder: (eventId: string, enabled: boolean) =>
        request<{ message: string; enabled: boolean }>(`/users/me/expeditions/${eventId}/reminder`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled }),
        }),

    getWishlist: () =>
        request<{ wishlist: any[] }>('/users/me/wishlist'),

    toggleWishlist: (itemId: string) =>
        request<{ message: string; wishlist: any[] }>(`/users/me/wishlist/${itemId}`, {
            method: 'PATCH',
        }),

    list: (page = 1, limit = 20, search = '') =>
        request<{ users: any[]; pagination: any }>('/users', {
            params: { page, limit, search },
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

    changeRole: (id: string, role: string) =>
        request<{ user: any; message: string }>(`/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }),
};

// ─── Stories API ───────────────────────────────────────────────────────

export const storiesApi = {
    list: (page = 1, limit = 12) =>
        request<{ stories: any[]; pagination: any }>('/stories', {
            params: { page, limit },
        }),

    get: (id: string) =>
        request<{ story: any }>(`/stories/${id}`),

    getMyStories: () => request<{ stories: any[] }>('/stories/user/me'),

    submit: (formData: FormData) =>
        request<{ story: any; message: string }>('/stories/submit', {
            method: 'POST',
            body: formData,
        }),

    create: (formData: FormData) =>
        request<{ story: any; message: string }>('/stories', {
            method: 'POST',
            body: formData,
        }),

    update: (id: string, formData: FormData) =>
        request<{ story: any; message: string }>(`/stories/${id}`, {
            method: 'PUT',
            body: formData,
        }),

    updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') =>
        request<{ story: any; message: string }>(`/stories/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/stories/${id}`, { method: 'DELETE' }),
};

// ─── Events API ────────────────────────────────────────────────────────

export const eventsApi = {
    list: (page = 1, limit = 10) =>
        request<{ events: any[]; pagination: any }>('/events', {
            params: { page, limit },
        }),

    get: (id: string) =>
        request<{ event: any }>(`/events/${id}`),

    create: (formData: FormData) =>
        request<{ event: any; message: string }>('/events', {
            method: 'POST',
            body: formData,
        }),

    update: (id: string, formData: FormData) =>
        request<{ event: any; message: string }>(`/events/${id}`, {
            method: 'PUT',
            body: formData,
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/events/${id}`, { method: 'DELETE' }),

    register: (id: string) =>
        request<{ event: any; message: string }>(`/events/${id}/register`, { method: 'POST' }),

    unregister: (id: string) =>
        request<{ event: any; message: string }>(`/events/${id}/unregister`, { method: 'DELETE' }),
};

// ─── Gallery API ───────────────────────────────────────────────────────

export const galleryApi = {
    list: (page = 1, limit = 20) =>
        request<{ items: any[]; pagination: any }>('/gallery', {
            params: { page, limit },
        }),

    listPending: () =>
        request<{ items: any[] }>('/gallery/pending'),

    listAll: (page = 1, limit = 20, status = '') =>
        request<{ items: any[]; pagination: any }>('/gallery/all', {
            params: { page, limit, ...(status && { status }) },
        }),

    getMyMedia: () => request<{ items: any[] }>('/gallery/user/me'),

    upload: (formData: FormData) =>
        request<{ item: any; message: string }>('/gallery', {
            method: 'POST',
            body: formData,
        }),

    update: (id: string, data: { title?: string; span?: string }) =>
        request<{ item: any; message: string }>(`/gallery/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    toggleLike: (id: string) =>
        request<{ message: string; likesCount: number; likes: string[] }>(`/gallery/${id}/like`, {
            method: 'POST',
        }),

    approve: (id: string) =>
        request<{ item: any; message: string }>(`/gallery/${id}/approve`, { method: 'PUT' }),

    reject: (id: string) =>
        request<{ item: any; message: string }>(`/gallery/${id}/reject`, { method: 'PUT' }),

    delete: (id: string) =>
        request<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
};

// ─── Community API ─────────────────────────────────────────────────────

export const communityApi = {
    listGroups: () => request<{ groups: any[] }>('/community/groups'),
    getMyGroups: () => request<{ groups: any[] }>('/community/groups/me'),
    getGroup: (id: string, page = 1) =>
        request<{ group: any; posts: any[]; pagination: any }>(`/community/groups/${id}`, {
            params: { page },
        }),

    createGroup: (data: { name: string; description: string }) =>
        request<{ group: any; message: string }>('/community/groups', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteGroup: (id: string) =>
        request<{ message: string }>(`/community/groups/${id}`, { method: 'DELETE' }),

    requestJoin: (groupId: string) =>
        request<{ message: string }>(`/community/groups/${groupId}/join`, { method: 'POST' }),

    approveJoin: (groupId: string, userId: string) =>
        request<{ message: string }>(`/community/groups/${groupId}/approve/${userId}`, { method: 'PUT' }),

    removeMember: (groupId: string, userId: string) =>
        request<{ message: string }>(`/community/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),

    createPost: (groupId: string, formData: FormData) =>
        request<{ post: any; message: string }>(`/community/groups/${groupId}/posts`, {
            method: 'POST',
            body: formData,
        }),

    addComment: (groupId: string, postId: string, content: string, mentions: string[] = []) =>
        request<{ post: any; message: string }>(`/community/groups/${groupId}/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content, mentions }),
        }),

    react: (groupId: string, postId: string, emoji: ReactionKey) =>
        request<{ reactions: { user: string; emoji: ReactionKey }[] }>(`/community/groups/${groupId}/posts/${postId}/react`, {
            method: 'POST',
            body: JSON.stringify({ emoji }),
        }),

    deletePost: (groupId: string, postId: string) =>
        request<{ message: string }>(`/community/groups/${groupId}/posts/${postId}`, { method: 'DELETE' }),

    deleteComment: (groupId: string, postId: string, commentId: string) =>
        request<{ post: any; message: string }>(`/community/groups/${groupId}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),

    leaveGroup: (groupId: string) =>
        request<{ message: string }>(`/community/groups/${groupId}/leave`, { method: 'POST' }),

    pinMessage: (groupId: string, message: string) =>
        request<{ group: any; message: string }>(`/community/groups/${groupId}/pin`, {
            method: 'PUT',
            body: JSON.stringify({ message }),
        }),

    assignModerator: (groupId: string, userId: string) =>
        request<{ group: any; message: string }>(`/community/groups/${groupId}/moderators/${userId}`, {
            method: 'PUT',
        }),
};

// ─── Admin API ─────────────────────────────────────────────────────────

export const adminApi = {
    getOverview: () =>
        request<{
            stats: any;
            recentUsers: any[];
            moderation?: { stories: number; media: number; reviews: number };
            signupTrend?: { date: string; count: number }[];
            upcomingEvents?: { id: string; title: string; date: string; location: string; totalSlots: number; filled: number }[];
        }>('/admin/overview'),

    listAdmins: () =>
        request<{ admins: any[] }>('/admin/admins'),

    createAdmin: (data: { name: string; email: string; password: string; permissions?: any }) =>
        request<{ admin: any; message: string }>('/admin/admins', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updatePermissions: (id: string, permissions: any) =>
        request<{ admin: any; message: string }>(`/admin/admins/${id}/permissions`, {
            method: 'PUT',
            body: JSON.stringify({ permissions }),
        }),

    revokeAdmin: (id: string) =>
        request<{ user: any; message: string }>(`/admin/admins/${id}`, { method: 'DELETE' }),
};

// ─── Contact API ───────────────────────────────────────────────────────

export const contactApi = {
    submit: (data: { name: string; email: string; subject: string; message: string }) =>
        request<{ message: string }>('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── Settings API ──────────────────────────────────────────────────────

export const settingsApi = {
    get: () =>
        request<{ settings: { sections: Record<string, any>; maintenance: { enabled: boolean; message: string; allowAdminAccess: boolean; theme?: string } } }>('/settings'),

    update: (data: { sections?: Record<string, any>; maintenance?: { enabled?: boolean; message?: string; allowAdminAccess?: boolean; theme?: string } }) =>
        request<{ settings: any; message: string }>('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ─── Pillars API ───────────────────────────────────────────────────────

export const pillarsApi = {
    list: () => request<any[]>('/pillars'),

    create: (data: any) =>
        request<{ _id: string }>('/pillars', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<{ _id: string }>('/pillars/' + id, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<{ message: string }>('/pillars/' + id, {
            method: 'DELETE',
        }),
};

// ─── Reviews API ───────────────────────────────────────────────────────

export const reviewsApi = {
    getApproved: () => request<any[]>('/reviews'),
    
    submit: (data: { content: string; rating: number }) =>
        request<{ message: string; review: any }>('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        
    getAllAdmin: () => request<any[]>('/reviews/admin'),
    
    update: (id: string, data: { content: string; rating: number; status?: string }) =>
        request<any>(`/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') =>
        request<any>(`/reviews/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        
    delete: (id: string) =>
        request<{ message: string }>(`/reviews/${id}`, {
            method: 'DELETE',
        }),
};

// ─── Merchandise API ───────────────────────────────────────────────────

export const merchandiseApi = {
    list: () => request<any[]>('/merchandise'),

    create: (data: any) =>
        request<any>('/merchandise', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<any>(`/merchandise/${id}`, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/merchandise/${id}`, {
            method: 'DELETE',
        }),
};

// ─── AI Insights API ───────────────────────────────────────────────────

export const aiApi = {
    chat: (messages: any[]) =>
        request<any>('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ messages }),
        }),
    getThemeSuggestion: (eventData: any) =>
        request<{ theme: any }>('/ai/theme-suggestion', {
            method: 'POST',
            body: JSON.stringify(eventData),
        }),
    getRouteBriefing: (eventId: string) =>
        request<{ briefing: any }>('/ai/route-briefing', {
            method: 'POST',
            body: JSON.stringify({ eventId }),
        }),
    getStoryDraft: (storyMeta: { title: string; region: string; notes?: string; language?: string }) =>
        request<{ draft: any }>('/ai/story-draft', {
            method: 'POST',
            body: JSON.stringify(storyMeta),
        }),
    tagGalleryItem: (itemId: string) =>
        request<{ tags: string[]; itemId: string }>('/ai/gallery-tag', {
            method: 'POST',
            body: JSON.stringify({ itemId }),
        }),
    bulkTagGallery: () =>
        request<{ message: string; taggedCount: number }>('/ai/gallery-tag-all', {
            method: 'POST',
        }),
    getReviewSummary: () =>
        request<{ summary: any; reviewCount: number }>('/ai/review-summary'),
    suggestImages: (context: any) =>
        request<{ query: string; images: any[] }>('/ai/suggest-images', {
            method: 'POST',
            body: JSON.stringify({ context }),
        }),
    searchUnsplash: (query: string) =>
        request<{ images: any[] }>('/ai/unsplash-search', {
            method: 'POST',
            body: JSON.stringify({ query }),
        }),
};

// ─── Campaigns API ─────────────────────────────────────────────────────

export const campaignApi = {
    list: () => request<{ campaigns: any[] }>('/admin/campaigns'),
    generate: (prompt: string) =>
        request<{ campaign: any; message: string }>('/admin/campaigns/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        }),
    approve: (id: string) =>
        request<{ campaign: any; message: string }>(`/admin/campaigns/${id}/approve`, {
            method: 'POST',
        }),
    delete: (id: string) =>
        request<{ message: string }>(`/admin/campaigns/${id}`, {
            method: 'DELETE',
        }),
};



// ─── Notifications, search, passport, moderation & audit ──────────────

export type ReactionKey = 'summit' | 'heart' | 'fire' | 'clap' | 'strong';

export interface AppNotification {
    _id: string;
    type: string;
    title: string;
    body?: string;
    link?: string;
    read: boolean;
    createdAt: string;
    actor?: { _id: string; name: string; avatar?: string } | null;
}

export const notificationsApi = {
    list: () => request<{ notifications: AppNotification[]; unread: number }>('/notifications'),
    markRead: (id: string) => request<{ ok: true }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<{ ok: true }>('/notifications/read-all', { method: 'POST' }),
    clear: () => request<{ ok: true }>('/notifications', { method: 'DELETE' }),
};

export interface SearchResult {
    kind: 'story' | 'event' | 'group' | 'media' | 'team' | 'shop';
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    href: string;
}

export const searchApi = {
    query: (q: string, signal?: AbortSignal) => request<{ results: SearchResult[] }>('/search', { params: { q }, signal }),
};

export interface Passport {
    stats: Record<string, number>;
    stamps: { id: string; title: string; location: string; difficulty: string; category?: string; date: string }[];
    upcoming: { id: string; title: string; location: string; date: string }[];
    badges: { id: string; name: string; description: string; earned: boolean }[];
    yearInReview: { year: number; summits: number; places: string[]; stories: number; posts: number; gainM: number; highlight: string | null };
}

export const passportApi = {
    get: () => request<Passport>('/users/me/passport'),
};

export const moderationApi = {
    stories: (ids: string[], status: 'approved' | 'rejected' | 'pending') =>
        request<{ message: string; updated: number }>('/stories/bulk-status', { method: 'PATCH', body: JSON.stringify({ ids, status }) }),
    media: (ids: string[], status: 'approved' | 'rejected') =>
        request<{ message: string; updated: number }>('/gallery/bulk-status', { method: 'PATCH', body: JSON.stringify({ ids, status }) }),
    reviews: (ids: string[], status: 'approved' | 'rejected' | 'pending') =>
        request<{ message: string; updated: number }>('/reviews/bulk-status', { method: 'PATCH', body: JSON.stringify({ ids, status }) }),
};

export const eventAdminApi = {
    participantsCsvUrl: (eventId: string) => `${API_URL}/api/events/${eventId}/participants.csv`,
    message: (eventId: string, data: { subject: string; message: string; channels: { email: boolean; notification: boolean } }) =>
        request<{ message: string; recipients: number; emailed: number }>(`/events/${eventId}/message`, {
            method: 'POST',
            body: JSON.stringify(data),
            timeoutMs: 60000,
        }),
};

export interface AuditEntry {
    id: string;
    type: 'admin_action' | 'login_success' | 'login_failure';
    user: { id: string; name: string; avatar?: string; role: string } | null;
    email: string;
    ip: string;
    details: string;
    at: string;
}

export const auditApi = {
    list: (params: { type?: string; page?: number }) =>
        request<{ logs: AuditEntry[]; pagination: { page: number; pages: number; total: number } }>('/admin/audit', {
            params: Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== '')) as Record<string, string | number>,
        }),
};
