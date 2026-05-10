import { API_URL } from './constants';

// ─── Base Fetch Wrapper ────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
    params?: Record<string, string | number>;
    retries?: number;
}

// Global auth invalidation callback
let onAuthInvalidated: (() => void) | null = null;
export const setAuthInvalidatedCallback = (cb: () => void) => { onAuthInvalidated = cb; };

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, retries = 0, ...fetchOptions } = options;

    let url = `${API_URL}/api${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    const config: RequestInit = {
        credentials: 'include',
        headers: {
            ...(!(fetchOptions.body instanceof FormData) && { 'Content-Type': 'application/json' }),
            ...fetchOptions.headers,
        },
        ...fetchOptions,
    };

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

        return response.json();
    } catch (error: any) {
        // Retry on network failures with exponential backoff (max 2 retries)
        if (!error.status && retries < 2) {
            const delay = Math.pow(2, retries) * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
            return request<T>(endpoint, { ...options, retries: retries + 1 });
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

    addComment: (groupId: string, postId: string, content: string) =>
        request<{ post: any; message: string }>(`/community/groups/${groupId}/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),

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
        request<{ stats: any; recentUsers: any[] }>('/admin/overview'),

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
        request<{ settings: { sections: Record<string, string>; maintenance: { enabled: boolean; message: string; allowAdminAccess: boolean } } }>('/settings'),

    update: (data: { sections?: Record<string, string>; maintenance?: { enabled?: boolean; message?: string; allowAdminAccess?: boolean } }) =>
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
