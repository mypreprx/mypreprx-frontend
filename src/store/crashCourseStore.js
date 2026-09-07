import { create } from 'zustand';
import api from '../config/axiosInstance';

const useCrashCourseStore = create((set) => ({
    courses: [],
    isLoading: false,
    error: null,

    fetchCrashCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/user/getAllCrashCourses');
            if (res.data && res.data.success) {
                // Normalize data: ensure each course has a 'topic' property for filtering
                const normalizedCourses = res.data.data.map(c => ({
                    ...c,
                    topic: c.topicId?.title || "Unknown"
                }));
                set({ courses: normalizedCourses, isLoading: false });
            } else {
                set({ isLoading: false, error: "Failed to fetch courses" });
            }
        } catch (error) {
            console.error("Error fetching crash courses:", error);
            set({
                error: error.message || "Error fetching crash courses",
                isLoading: false
            });
        }
    }
}));

export default useCrashCourseStore;
