import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useSubliminalStore = create((set, get) => ({
    audios: [],
    categories: [],
    currentAudio: null,
    isLoading: false,
    error: null,
    isPlaying: false,
    audioInstance: null,

    // --- User Actions ---
    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/user/StudyMode/categories');
            if (response.data.success) {
                set({ categories: response.data.data || [], isLoading: false });
                return response.data.data;
            }
        } catch (err) {
            console.error("Fetch Categories Error:", err);
            set({ isLoading: false });
        }
    },

    fetchAudioByCategory: async (category) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/user/StudyMode/getAudio/${category}`);
            if (response.data.success) {
                set({ currentAudio: response.data.data, isLoading: false });
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch audio');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'No audio found for this category';
            set({ error: msg, isLoading: false, currentAudio: null });
            return null;
        }
    },

    // --- Admin Actions ---
    fetchAllAudios: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/admin/StudyMode/allAudios');
            set({ audios: response.data.data || [], isLoading: false });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch audios';
            set({ error: msg, isLoading: false });
            toast.error(msg);
        }
    },

    uploadAudio: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/admin/StudyMode/createAudio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                toast.success('Audio uploaded successfully');
                set((state) => ({
                    audios: [response.data.data, ...state.audios],
                    isLoading: false
                }));
                return true;
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to upload audio';
            toast.error(msg);
            set({ isLoading: false });
            return false;
        }
    },

    updateAudio: async (id, data) => {
        set({ isLoading: true });
        try {
            const config = data instanceof FormData
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};
            const response = await api.put(`/admin/StudyMode/updateAudio/${id}`, data, config);
            if (response.data.success) {
                toast.success('Audio updated successfully');
                set((state) => ({
                    audios: state.audios.map(audio => audio._id === id ? response.data.data : audio),
                    isLoading: false
                }));
                return true;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update audio');
            set({ isLoading: false });
            return false;
        }
    },

    deleteAudio: async (id) => {
        try {
            const response = await api.delete(`/admin/StudyMode/deleteAudio/${id}`);
            if (response.data.success) {
                toast.success('Audio deleted successfully');
                set((state) => ({
                    audios: state.audios.filter(audio => audio._id !== id)
                }));
                return true;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete audio');
            return false;
        }
    },

    // --- Common Actions ---
    togglePlay: (status) => {
        set({ isPlaying: status !== undefined ? status : !get().isPlaying });
    },

    playAudioUrl: (url) => {
        const { audioInstance } = get();
        if (audioInstance) {
            audioInstance.pause();
        }
        try {
            const newAudio = new Audio(url);
            newAudio.loop = true;
            newAudio.volume = 0.3;
            newAudio.play().then(() => {
                set({ audioInstance: newAudio, isPlaying: true });
            }).catch((err) => {
                console.error("Playback failed:", err);
                toast.error("Unable to play audio. Please try again.");
                set({ isPlaying: false });
            });
        } catch (err) {
            console.error("Audio creation failed:", err);
            toast.error("Unable to initialize audio playback.");
            set({ isPlaying: false });
        }
    },

    stopAudio: () => {
        const { audioInstance } = get();
        if (audioInstance) {
            audioInstance.pause();
        }
        set({ audioInstance: null, isPlaying: false });
    }
}));

export default useSubliminalStore;
