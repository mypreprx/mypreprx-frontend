import { create } from 'zustand';
import api from '../config/axiosInstance';

const useAnalyticsStore = create((set) => ({
    analytics: null,
    isLoading: false,
    error: null,

    fetchAnalytics: async (range = 'Last 30 Days') => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/admin/analytics', { params: { range } });
            set({ analytics: response.data.data || null, isLoading: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch analytics';
            set({ error: msg, isLoading: false, analytics: null });
        }
    },
}));

export default useAnalyticsStore;
