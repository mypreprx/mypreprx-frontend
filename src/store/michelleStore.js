import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

const useMichelleStore = create((set, get) => ({
    sessions: [], // List of chat history items
    currentSessionId: null,
    messages: [], // Current conversation messages
    isLoading: false,
    historyLoading: false,

    // Fetch chat history for the sidebar/dropdown
    fetchHistory: async (userId) => {
        if (!userId) return;
        set({ historyLoading: true });
        try {
            const response = await api.get(`/user/getHistory/${userId}`);
            if (response.data.success) {
                set({ sessions: response.data.data });
            }
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            // toast.error("Could not load chat history");
        } finally {
            set({ historyLoading: false });
        }
    },

    // Load a specific chat session
    loadSession: async (sessionId) => {
        set({ isLoading: true, currentSessionId: sessionId, messages: [] });
        try {
            const response = await api.get(`/user/getSession/${sessionId}`);
            if (response.data.success) {
                set({
                    messages: response.data.data.messages,
                    currentSessionId: sessionId
                });
            }
        } catch (error) {
            console.error("Failed to load session:", error);
            toast.error("Failed to load chat conversation");
            set({ currentSessionId: null });
        } finally {
            set({ isLoading: false });
        }
    },

    // Start a fresh chat (clear current session)
    startNewChat: () => {
        set({ currentSessionId: null, messages: [] });
    },

    // Send a message
    sendMessage: async (message) => {
        if (!message.trim()) return;

        const { currentSessionId, messages } = get();

        // Optimistic update: Add user message immediately
        const tempUserMessage = { role: 'user', content: message, _id: Date.now().toString() };
        set({ messages: [...messages, tempUserMessage], isLoading: true });

        try {
            const payload = {
                message,
                sessionId: currentSessionId // If null, backend creates new session
            };

            const response = await api.post('/user/sendMessagetoBot', payload);

            if (response.data.success) {
                const { sessionId, history, title } = response.data.data;

                // Update state with server response (which includes the full history or we can just append)
                // The backend returns: sessionId, title, reply, history (full array)
                set({
                    messages: history,
                    currentSessionId: sessionId,
                    isLoading: false
                });

                // Retrieve user ID from auth store if possible, or trigger a history refresh
                // Since we don't have direct access to userId here without circular dependency or passing it in,
                // we might need to rely on the component to refresh history, or we can just manually add to sessions if it's new.

                // If it was a new session, prepend it to our sessions list locally to update UI immediately
                if (!currentSessionId) {
                    const newSessionSummary = {
                        _id: sessionId,
                        title: title,
                        updatedAt: new Date().toISOString()
                    };
                    set(state => ({
                        sessions: [newSessionSummary, ...state.sessions]
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
            set({ isLoading: false });

            // Remove the optimistic message on failure? Or keep it with error state?
            // For now, let's remove it to avoid confusion or keep it and show error.
            // Simplest: Revert messages to previous state (filtering out the optimistic one if needed, but we don't have previous state saved).
            // Actually, we can just remove the last one if we want.
        }
    }
}));

export default useMichelleStore;
