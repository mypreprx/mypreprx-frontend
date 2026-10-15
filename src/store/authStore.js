import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';
import { clearPendingPromo } from '../utils/promoStorage';

// `/user/login` returns only a token — never a user — so the profile must come
// from `/user/Home`. That second call can fail transiently (mobile network, 5xx).
// Retrying briefly absorbs the blip; if it still fails we surface an error rather
// than storing `user: undefined`, which would leave `isAuthenticated: true` with
// no profile and strand the user on the login page with nothing to act on.
const fetchProfileWithRetry = async (attempts = 3) => {
    let lastError;
    for (let i = 0; i < attempts; i += 1) {
        try {
            const res = await api.get('/user/Home');
            if (res.data?.user) return res.data.user;
            lastError = new Error('Profile response did not include a user');
        } catch (error) {
            lastError = error;
            // A definitive rejection (invalid/expired session) will not fix itself.
            const status = error.response?.status;
            if (status && status < 500) throw error;
        }
        if (i < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
        }
    }
    throw lastError || new Error('Unable to load profile');
};

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
                const profile = await fetchProfileWithRetry();
                set({ user: profile });
            } catch {
                // Never fall back to `response.data.user`: the login response
                // carries no user, so that would cache `undefined` and strand
                // the session. Drop the token and let the user retry.
                localStorage.removeItem('token');
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    loadingText: '',
                    error: 'Could not load your profile. Please try again.',
                });
                const profileError = new Error('Could not load your profile. Please try again.');
                profileError.userMessage = 'Could not load your profile. Please try again.';
                throw profileError;
            }

            toast.success("Login successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.userMessage || "Login failed";
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
                const profile = await fetchProfileWithRetry();
                set({ user: profile });
            } catch {
                localStorage.removeItem('token');
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    loadingText: '',
                    error: 'Could not load your profile. Please try again.',
                });
                const profileError = new Error('Could not load your profile. Please try again.');
                profileError.userMessage = 'Could not load your profile. Please try again.';
                throw profileError;
            }

            toast.success("Google sign in successful!");
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.userMessage || "Google sign in failed";
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
        const response = await api.post('/user/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        set({ error: null, isLoading: true, loadingText: 'Updating password...' });
        try {
            const response = await api.post(`/user/reset-password/${token}`, { password });
            set({ isLoading: false, loadingText: '' });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Password reset failed';
            set({ error: errorMessage, isLoading: false, loadingText: '' });
            throw error;
        }
    },

    /**
     * Redeem a single-use promo code for the signed-in account.
     * Throws so the caller can render the server's message.
     */
    redeemPromo: async (code) => {
        try {
            const response = await api.post('/user/promo/redeem', { code });

            // Pull the fresh profile so `subscription` reflects the new
            // entitlement and routing decisions use current data.
            try {
                const profileRes = await api.get('/user/Home');
                set({ user: profileRes.data.user });
            } catch {
                // Entitlement already applied server-side; a stale profile here
                // only affects the next redirect, not the access itself.
            }

            clearPendingPromo();
            return response.data;
        } catch (error) {
            // A 4xx is a definitive answer (invalid / already used / already
            // subscribed), so stop carrying the code. A 5xx or a dropped
            // connection may be transient, so keep it and let the user retry.
            const status = error.response?.status;
            if (status && status < 500) {
                clearPendingPromo();
            }
            throw error;
        }
    },

    updateNclexExamDate: async (nclexExamDate) => {
        const response = await api.put('/user/nclex-exam-date', { nclexExamDate });
        if (response.data?.user) {
            set({ user: response.data.user });
        }
        return response.data;
    }
}));

export default useAuthStore;
