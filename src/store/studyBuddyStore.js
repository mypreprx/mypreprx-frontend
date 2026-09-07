import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Zustand store for managing Study Buddy Requests
 * Handles fetching requests, creating new requests, and sending chat messages
 */
const useStudyBuddyStore = create((set, get) => ({
    // State
    requests: [],
    topics: [],
    currentRequest: null,
    isLoading: false,
    isCreating: false,
    isSending: false,
    isLoadingDetails: false,
    error: null,

    /**
     * Fetch all study buddy requests
     * API: GET /user/getAllStudyRequests?filterTopicId=<id>
     * @param {string} filterTopicId - Optional topic ID to filter by
     */
    fetchRequests: async (filterTopicId = null) => {
        set({ isLoading: true, error: null });
        try {
            const params = filterTopicId && filterTopicId !== 'All'
                ? `?filterTopicId=${filterTopicId}`
                : '';
            const response = await api.get(`/user/getAllStudyRequests${params}`);
            set({ requests: response.data.data || [], isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch study requests';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    /**
     * Fetch all topics for filtering and creating requests
     * API: GET /user/getAllTopics
     */
    fetchTopics: async () => {
        try {
            const response = await api.get('/user/getAllTopics');
            set({ topics: response.data.data || [] });
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        }
    },

    /**
     * Create a new study buddy request
     * API: POST /user/createStudyRequest
     * @param {Object} requestData - { topicId, goal, availability }
     */
    createRequest: async (requestData) => {
        set({ isCreating: true, error: null });
        try {
            const response = await api.post('/user/createStudyRequest', requestData);
            const newRequest = response.data.data;

            // Add to the beginning of the list
            set(state => ({
                requests: [newRequest, ...state.requests],
                isCreating: false
            }));

            toast.success('Study request posted successfully!');
            return newRequest;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create study request';
            set({ error: errorMessage, isCreating: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Send a message/reply to a study request (chat functionality)
     * API: POST /user/replyToStudyRequest/:requestId
     * @param {string} requestId - ID of the request to reply to
     * @param {string} message - Message text
     */
   sendMessage: async (requestId, message) => {
    set({ isSending: true, error: null });
    try {
        const response = await api.post(`/user/replyToStudyRequest/${requestId}`, { message });
        // Assuming your backend returns { success: true, data: { addedReply, updatedRequest } }
        const { addedReply, updatedRequest } = response.data.data;

        set(state => ({
            isSending: false,
            // 1. Update the main list (so the "Responses" count updates)
            requests: state.requests.map(req => 
                req._id === requestId ? updatedRequest : req
            ),
            // 2. Update the active request if the user is currently looking at it
            currentRequest: state.currentRequest?._id === requestId 
                ? updatedRequest 
                : state.currentRequest
        }));

        return addedReply;
    } catch (error) {
        set({ isSending: false, error: error.message });
        throw error;
    }
},

    /**
     * Set the current request for viewing details/chat
     * @param {Object} request - The request object to view
     */
    setCurrentRequest: (request) => {
        set({ currentRequest: request });
    },

    /**
     * Clear current request
     */
    clearCurrentRequest: () => {
        set({ currentRequest: null });
    },

    /**
     * Clear all data (e.g., on logout)
     */
    clearStore: () => set({
        requests: [],
        topics: [],
        currentRequest: null,
        error: null
    })
}));

export default useStudyBuddyStore;
