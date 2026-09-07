import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useGrowthZoneStore = create((set, get) => ({
    allTopics: [], // All available topics from database (for GrowthZones page)
    userTopics: [], // User's saved topic objects with titles (for CustomQuizzes)
    isLoading: false,
    isFetchingTopics: false,
    error: null,

    // Fetch all available topics from database
    fetchAllTopics: async () => {
        set({ isFetchingTopics: true });
        try {
            // API Call: GET /user/getAllTopics
            // Fetches the complete list of available topics from the database.
            const response = await api.get('/user/getAllTopics');
            const topics = response.data.data || [];
            set({ allTopics: topics, isFetchingTopics: false });
            return topics;
        } catch (error) {
            console.error("Failed to fetch all topics:", error);
            set({ isFetchingTopics: false });
            return [];
        }
    },

    // Fetch user's saved topics from DB (for CustomQuizzes)
    fetchUserSavedTopics: async () => {
        set({ isLoading: true });
        try {
            // 1. Get User's Saved IDs
            // API Call: GET /user/Home
            // Retrieves the current user's profile, including their list of interested topic IDs.
            const userRes = await api.get('/user/Home');
            const savedIds = userRes.data.user.interestTopic || [];


            // 2. Get All Topics (to resolve details like titles)
            // API Call: GET /user/getAllTopics
            // Fetches all topics to match against the user's saved IDs.
            // (We could check if get().allTopics is already populated, but safe to fetch fresh)
            const topicsRes = await api.get('/user/getAllTopics');
            const allTopics = topicsRes.data.data || [];

            // 3. Match IDs to Objects
            const resolvedTopics = allTopics.filter(topic =>
                savedIds.includes(topic._id) || savedIds.includes(topic._id.toString())
            );

            set({
                userTopics: resolvedTopics,
                allTopics: allTopics,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to fetch user saved topics:", error);
            set({ isLoading: false });
        }
    },

    // Save selected growth zone topics to backend and store full topic objects
  saveGrowthZones: async (selectedIds) => {
    set({ isLoading: true, error: null });
    try {
        // API Call: POST /user/chooseurGrowthZone
        // We send the IDs directly. Note the key name 'titles' matches your backend.
        await api.post('/user/chooseurGrowthZone', { titles: selectedIds });

        set({ isLoading: false });

        toast.success("Topics saved successfully!");
        return { success: true };
    } catch (error) {
        console.log("Failed to save growth zone topics:", error.message);
        set({ isLoading: false, error: error.message });
        toast.error("Failed to save topics.");
        throw error;
    }
},

    // Clear topics (useful for logout)
    clearTopics: () => set({ userTopics: [], error: null })
}));

export default useGrowthZoneStore;
