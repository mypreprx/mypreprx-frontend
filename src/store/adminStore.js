import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useAdminStore = create((set) => ({
    courses: [],
    visualizations: [],
    topics: [],
    users: [],
    promoCodes: [],
    stats: {
        totalUsers: 0,
        totalCourses: 0,
        totalSubliminals: 0,
        coursesByType: [],
        coursesByTopic: [],
        subliminalsByCategory: [],
        recentUsers: []
    },
    isLoading: false,
    isFetching: false,
    error: null,

    fetchCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/admin/getAllCrashCourses');
            set({ courses: response.data.data || [], isLoading: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch crash courses';
            set({ error: msg, isLoading: false });
            toast.error(msg);
        }
    },

    fetchVisualizations: async () => {
        set({ isFetching: true, isLoading: true, error: null });
        try {
            const response = await api.get('/admin/getAllVisualization');
            set({ visualizations: response.data.data || [], isFetching: false, isLoading: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch visualizations';
            set({ error: msg, isFetching: false, isLoading: false });
            toast.error(msg);
        }
    },

    createVisualization: async (formData, onProgress) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/admin/createVisualization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                }
            });
            toast.success('Visualization added successfully');
            set((state) => ({ visualizations: [response.data.data, ...state.visualizations], isLoading: false }));
            return true;
        } catch (err) {
            console.error("Upload error:", err);
            let msg = err.response?.data?.message;
            if (!msg) {
                if (err.response?.status === 413) {
                    msg = 'File size exceeds server upload limit (HTTP 413 Payload Too Large). Please check Nginx client_max_body_size setting on server.';
                } else if (err.response?.status === 504 || err.code === 'ECONNABORTED') {
                    msg = 'Upload timed out. File transfer took too long or server connection timed out.';
                } else {
                    msg = err.message || 'Failed to add visualization';
                }
            }
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    updateVisualization: async (id, formData, onProgress) => {
        set({ isLoading: true });
        try {
            const response = await api.post(`/admin/updateVisualization/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                }
            });
            toast.success('Visualization updated successfully');
            set((state) => ({
                visualizations: state.visualizations.map(v => v._id === id ? response.data.data : v),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error("Update error:", err);
            let msg = err.response?.data?.message;
            if (!msg) {
                if (err.response?.status === 413) {
                    msg = 'File size exceeds server upload limit (HTTP 413 Payload Too Large). Please check Nginx client_max_body_size setting on server.';
                } else if (err.response?.status === 504 || err.code === 'ECONNABORTED') {
                    msg = 'Upload timed out. File transfer took too long or server connection timed out.';
                } else {
                    msg = err.message || 'Failed to update visualization';
                }
            }
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    deleteVisualization: async (id) => {
        try {
            await api.get(`/admin/deleteVisualization/${id}`);
            toast.success('Visualization deleted successfully');
            set((state) => ({
                visualizations: state.visualizations.filter(v => v._id !== id)
            }));
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete visualization');
            return false;
        }
    },

    fetchTopics: async () => {
        try {
            const response = await api.get('/admin/alltopics');
            set({ topics: response.data.data || [] });
        } catch (err) {
            toast.error('Failed to load topics');
        }
    },

    // generate AI subtopics for a main topic (does not persist on backend)
    generateTopics: async (mainTopic) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/admin/genrateTopics', { topic: mainTopic });
            set({ isLoading: false });
            return res.data.data || res.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate topics';
            toast.error(msg);
            set({ isLoading: false });
            return null;
        }
    },

    // save a list of subtopics returned from AI for a given topic id
    saveSubtopics: async (topicId, subtopics) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/admin/addTopics', {
                topicId,
                subtopic: subtopics
            });
            toast.success('Subtopics saved successfully');
            // refresh topics list after adding
            await get().fetchTopics();
            set({ isLoading: false });
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save subtopics';
            toast.error(msg);
            set({ isLoading: false });
            return null;
        }
    },

    // fetch subtopics for a specific topic
    getSubtopicsForTopic: async (topicId) => {
        try {
            const res = await api.get(`/admin/subtopicsforTopic/${topicId}`);
            return res.data.data || [];
        } catch (err) {
            toast.error('Failed to load subtopics');
            return [];
        }
    },

    // update topic title/description and subtopics
    updateTopic: async (topicId, topicData) => {
        set({ isLoading: true });
        try {
            const res = await api.post(`/admin/updateTopics/${topicId}`, topicData);
            toast.success('Topic updated successfully');
            // Update local state instead of refetching
            set((state) => ({
                topics: state.topics.map(t => t._id === topicId ? res.data.data : t),
                isLoading: false
            }));
            return res.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update topic';
            toast.error(msg);
            set({ isLoading: false });
            return null;
        }
    },

    // delete a topic and all its subtopics
    deleteTopic: async (topicId) => {
        set({ isLoading: true });
        try {
            await api.get(`/admin/deleteTopics/${topicId}`);
            toast.success('Topic deleted successfully');
            // Update local state directly without refetching
            set((state) => ({
                topics: state.topics.filter(t => t._id !== topicId),
                isLoading: false
            }));
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete topic';
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    addCourse: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/admin/addCrashCourse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Crash course added successfully');
            set((state) => ({ courses: [...state.courses, response.data.data], isLoading: false }));
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add course';
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    updateCourse: async (id, formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post(`/admin/updateCrashCourse/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Crash course updated successfully');
            set((state) => ({
                courses: state.courses.map(c => c._id === id ? response.data.data : c),
                isLoading: false
            }));
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update course';
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    deleteCourse: async (id) => {
        try {
            await api.get(`/admin/deleteCrashCourse/${id}`);
            toast.success('Crash course deleted successfully');
            set((state) => ({
                courses: state.courses.filter(c => c._id !== id)
            }));
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
            return false;
        }
    },

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/admin/users');
            set({ users: response.data.data || [], isLoading: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch users';
            set({ error: msg, isLoading: false });
            toast.error(msg);
        }
    },

    // Admin exception: immediate Stripe cancellation (does not delete the account)
    cancelUserSubscription: async (userId) => {
        try {
            const response = await api.post(`/admin/subscriptions/${userId}/cancel-immediate`);
            toast.success(response.data?.message || 'Subscription canceled immediately');
            await useAdminStore.getState().fetchUsers();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel subscription');
            return false;
        }
    },

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const results = await Promise.allSettled([
                api.get('/admin/users'),
                api.get('/admin/getAllCrashCourses'),
                api.get('/admin/StudyMode/allAudios')
            ]);

            // Extract data safely, defaulting to empty arrays if failed
            const users = results[0].status === 'fulfilled' ? (results[0].value.data.data || []) : [];
            const courses = results[1].status === 'fulfilled' ? (results[1].value.data.data || []) : [];
            const subliminals = results[2].status === 'fulfilled' ? (results[2].value.data.data || []) : [];

            // Log any failed requests for debugging
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Dashboard API call ${index} failed:`, result.reason?.response?.data || result.reason?.message);
                }
            });

            // Process course types
            const typeCount = courses.reduce((acc, course) => {
                if (course.fileType) {
                    acc[course.fileType] = (acc[course.fileType] || 0) + 1;
                }
                return acc;
            }, {});

            const coursesByType = Object.entries(typeCount).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }));

            // Get courses by topic
            const topicCount = courses.reduce((acc, course) => {
                const topicName = course.topicId?.title || 'Unknown';
                acc[topicName] = (acc[topicName] || 0) + 1;
                return acc;
            }, {});

            const coursesByTopic = Object.entries(topicCount)
                .map(([name, count]) => ({ name, count }))
                .slice(0, 6);

            // Process subliminal categories
            const subCatCount = subliminals.reduce((acc, audio) => {
                if (audio.category) {
                    acc[audio.category] = (acc[audio.category] || 0) + 1;
                }
                return acc;
            }, {});

            const subliminalsByCategory = Object.entries(subCatCount).map(([name, value]) => ({
                name,
                value
            }));

            // Recent users (last 5)
            const recentUsers = [...users]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            set({
                stats: {
                    totalUsers: users.length,
                    totalCourses: courses.length,
                    totalSubliminals: subliminals.length,
                    coursesByType,
                    coursesByTopic,
                    subliminalsByCategory,
                    recentUsers
                },
                isLoading: false
            });
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            set({
                stats: {
                    totalUsers: 0,
                    totalCourses: 0,
                    totalSubliminals: 0,
                    coursesByType: [],
                    coursesByTopic: [],
                    subliminalsByCategory: [],
                    recentUsers: []
                },
                error: 'Failed to fetch dashboard data',
                isLoading: false
            });
            toast.error('Failed to load dashboard data');
        }
    },

    /* --------------------------- Promo codes --------------------------- */

    fetchPromoCodes: async () => {
        set({ isFetching: true, error: null });
        try {
            const response = await api.get('/admin/promo-codes');
            set({ promoCodes: response.data.data || [], isFetching: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load promo codes';
            set({ error: msg, isFetching: false });
            toast.error(msg);
        }
    },

    /**
     * Downloads the QR as a real PNG file.
     *
     * Fetched as a blob rather than a plain `<a download>` because the endpoint
     * requires the admin bearer token — a bare link would return 401. The
     * object URL is revoked immediately after the click is dispatched.
     */
    downloadPromoQr: async (id, code) => {
        try {
            const response = await api.get(`/admin/promo-codes/${id}/qr`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promo-${code}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success('QR code downloaded');
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to download the QR code';
            toast.error(msg);
            return false;
        }
    },

    /** Preview a random code + link without saving anything. */
    generatePromoCode: async () => {
        try {
            const response = await api.get('/admin/promo-codes/generate');
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate a promo code';
            toast.error(msg);
            return null;
        }
    },

    createPromoCode: async (payload) => {
        set({ isFetching: true });
        try {
            await api.post('/admin/promo-codes', payload);
            await useAdminStore.getState().fetchPromoCodes();
            toast.success('Promo code created');
            set({ isFetching: false });
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create promo code';
            toast.error(msg);
            set({ isFetching: false });
            return false;
        }
    },

    updatePromoCode: async (id, payload) => {
        set({ isFetching: true });
        try {
            await api.put(`/admin/promo-codes/${id}`, payload);
            await useAdminStore.getState().fetchPromoCodes();
            toast.success('Promo code updated');
            set({ isFetching: false });
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update promo code';
            toast.error(msg);
            set({ isFetching: false });
            return false;
        }
    },

    deletePromoCode: async (id) => {
        try {
            await api.delete(`/admin/promo-codes/${id}`);
            await useAdminStore.getState().fetchPromoCodes();
            toast.success('Promo code deleted');
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete promo code';
            toast.error(msg);
            return false;
        }
    }

}));

export default useAdminStore;