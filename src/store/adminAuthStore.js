import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useAdminAuthStore = create((set) => ({
    admin: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    error: null,
    isLoading: false,

    checkAdminAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            // API Call: GET /admin/dashboard
            // Verifies the admin's session and retrieves admin details.
            const response = await api.get('/admin/dashboard');
            set({
                admin: response.data.user || response.data.admin,
                isAuthenticated: true,
                isCheckingAuth: false
            });
        } catch (error) {
            set({ admin: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },

    login: async (email, password) => {
        set({ error: null, isLoading: true });
        try {
            // API Call: POST /admin/login
            const response = await api.post('/admin/login', { email, password });
            if (response.data?.token) {
                localStorage.setItem('adminToken', response.data.token);
            }
            set({
                admin: response.data.admin,
                isAuthenticated: true,
                error: null,
                isLoading: false,
                isCheckingAuth: false
            });
            toast.success("Admin login successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            set({ error: errorMessage, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            // Clear the cookie by calling user logout (same cookie)
            await api.get('/admin/logout');
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            // ALWAYS clear state, localStorage, and redirect even if API fails
            localStorage.removeItem('adminToken');
            set({ admin: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
            toast.success("Logged out successfully");
            window.location.href = '/admin/login';
        }
    }
}));

export default useAdminAuthStore;
