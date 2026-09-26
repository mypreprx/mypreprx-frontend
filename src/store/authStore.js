import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    error: null,
    isLoading: false,
    loadingText: '',

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            // API Call: GET /user/Home
            // Verifies the user's session and retrieves user details.
            const response = await api.get('/user/Home');
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false, error: error.response?.data?.message || "Authentication check failed" });
        }
    },

    login: async (email, password) => {
        set({ error: null, isLoading: true, loadingText: 'Logging in...' });
        try {
            // API Call: POST /user/login
            // Authenticates the user with email and password.
            const response = await api.post('/user/login', { email, password });
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }
            // Set authenticated flag immediately so protected routes open
            set({ isAuthenticated: true, error: null, isLoading: false, loadingText: '' });

            // Fetch full user profile (includes interestTopic, username, etc.)
            // so that RedirectAuthenticatedUser can navigate correctly
            try {
                const profileRes = await api.get('/user/Home');
                set({ user: profileRes.data.user });
            } catch (_) {
                // Fallback: use what the login response gave us
                set({ user: response.data.user });
            }

            toast.success("Login successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            set({ error: errorMessage, isAuthenticated: false, isLoading: false, loadingText: '' });
            toast.error(errorMessage);
            throw error;
        }
    },

    googleSignIn: async (credentialResponse) => {
        set({ error: null, isLoading: true, loadingText: 'Signing in with Google...' });
        try {
            // API Call: POST /user/google-signin
            // Authenticates the user with Google OAuth token.
            // Backend should handle both login and signup based on whether user exists
            const response = await api.post('/user/google-signin', {
                token: credentialResponse.credential
            });
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }
            set({ isAuthenticated: true, error: null, isLoading: false, loadingText: '' });

            // Fetch full user profile (includes interestTopic, username, etc.)
            try {
                const profileRes = await api.get('/user/Home');
                set({ user: profileRes.data.user });
            } catch (_) {
                set({ user: response.data.user });
            }

            toast.success("Google sign in successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Google sign in failed";
            set({ error: errorMessage, isAuthenticated: false, isLoading: false, loadingText: '' });
            toast.error(errorMessage);
            throw error;
        }
    },

    register: async (userInfo) => {
        set({ error: null, isLoading: true, loadingText: 'Signing up...' });
        try {
            // API Call: POST /user/register
            // Registers a new user with the provided information.
            const response = await api.post('/user/register', userInfo);
            set({ isLoading: false, loadingText: '' });
            toast.success("Registration successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed";
            set({ error: errorMessage, isLoading: false, loadingText: '' });
            toast.error(errorMessage);
            throw error;
        }
    },

    setUser: (updatedUser) => set({ user: updatedUser }),

    logout: async () => {
        set({ isLoading: true, loadingText: 'Logging out...' });
        try {
            // API Call: GET /user/logout
            // Logs out the user on the server side (clears cookies).
            await api.get('/user/logout');
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isLoading: false, loadingText: '' });
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isLoading: false, loadingText: '' });
            toast.error("Logout failed, but session cleared locally");
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/user/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        try {
            const response = await api.post(`/user/reset-password/${token}`, { password });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}));

export default useAuthStore;
