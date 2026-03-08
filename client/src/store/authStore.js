import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: async () => {
        try {
            const res = await api.get('/api/auth/me');
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        set({ user: res.data.user, isAuthenticated: true });
        return res.data;
    },

    register: async (data) => {
        const res = await api.post('/api/auth/register', data);
        set({ user: res.data.user, isAuthenticated: true });
        return res.data;
    },

    logout: async () => {
        await api.post('/api/auth/logout');
        set({ user: null, isAuthenticated: false });
    },

    setUser: (user) => set({ user }),
}));

export default useAuthStore;
