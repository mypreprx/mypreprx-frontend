import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Zustand store for managing Nursing Tips (Questions)
 * Handles fetching, creating, liking, and commenting on questions
 */
const useQuestionStore = create((set, get) => ({
    // State
    questions: [],
    isLoading: false,
    isCreatingQuestion: false,
    error: null,

    /**
     * Fetch all questions from the server
     * API: GET /user/tipsgetallPosts
     * @param {string} topicId - Optional topic filter
     */
    fetchQuestions: async (topicId = 'All') => {
        set({ isLoading: true, error: null });
        try {
            const url = topicId && topicId !== 'All'
                ? `/user/tipsgetallPosts?topicId=${topicId}`
                : '/user/tipsgetallPosts';

            const response = await api.get(url);
            // console.log("Fetch Questions Response:", response.data); 

            // Backend returns data in 'data' field
            const questionsList = response.data.data || response.data.questions || response.data.posts || (Array.isArray(response.data) ? response.data : []);

            set({ questions: questionsList, isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch questions';
            set({ error: errorMessage, isLoading: false });
            console.error(errorMessage);
        }
    },

    /**
     * Create a new question
     * API: POST /user/shareNursingTips
     * @param {string} content - Question text
     * @param {string} topicId - ID of the related topic
     */
    createQuestion: async (content, topicId) => {
        set({ isCreatingQuestion: true, error: null });
        try {
            const payload = {
                content,
                topicId
            };

            const response = await api.post('/user/shareNursingTips', payload);

            const newQuestion = response.data.data || response.data.question;

            if (newQuestion) {
                // Add new question to the beginning of questions array
                set(state => ({
                    questions: [newQuestion, ...state.questions],
                    isCreatingQuestion: false
                }));
            } else {
                // Fallback: fetch valid list
                console.warn("API did not return a question object. Fetching list...");
                set({ isCreatingQuestion: false });
                get().fetchQuestions();
            }

            toast.success('Question asked successfully!');
            return newQuestion;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to post question';
            set({ error: errorMessage, isCreatingQuestion: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Toggle like on a question
     * API: GET /user/tipslike/:postid
     * @param {string} questionId - ID of the question to like/unlike
     * @param {string} currentUserId - To update state locally
     */
    toggleLike: async (questionId, currentUserId) => {
        try {
            const response = await api.get(`/user/tipslike/${questionId}`);
            // Backend returns { success: true, message: "...", likesCount: X }
            const likesCount = response.data.likesCount;

            // Since backend doesn't return the full array, we toggle currentUserId locally
            set(state => ({
                questions: state.questions.map(q => {
                    if (q._id === questionId) {
                        const isLiked = q.likes?.includes(currentUserId);
                        let newLikes = [...(q.likes || [])];

                        if (isLiked) {
                            newLikes = newLikes.filter(id => id !== currentUserId);
                        } else {
                            newLikes.push(currentUserId);
                        }

                        // We use the count from backend if available, or just rely on array length
                        return { ...q, likes: newLikes };
                    }
                    return q;
                })
            }));
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Failed to update like';
            toast.error(errorMessage);
        }
    },

    /**
     * Add a comment to a question
     * API: POST /user/tipscomment/:postid
     * @param {string} questionId - ID of the question
     * @param {string} commentText - Comment text
     * @param {Object} currentUser - For optimistic/immediate update
     */
    addComment: async (questionId, commentText, currentUser = null) => {
        try {
            // Backend expects 'text' field
            const response = await api.post(`/user/tipscomment/${questionId}`, {
                text: commentText
            });
            // Backend returns updated tip in 'data'
            const updatedTip = response.data.data;
            const updatedComments = [...updatedTip.comments].reverse();

            // Update the specific question's comments in state
            set(state => ({
                questions: state.questions.map(q =>
                    q._id === questionId ? { ...q, comments: updatedComments } : q
                )
            }));

            toast.success('Comment added!');
            return updatedComments;
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.msg || 'Failed to add comment';
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Delete a question
     * API: GET /user/deleteTip/:id
     * @param {string} questionId - ID of the question
     */
    deleteQuestion: async (questionId) => {
        try {
            const response = await api.get(`/user/deleteTip/${questionId}`);
            if (response.data.success) {
                set(state => ({
                    questions: state.questions.filter(q => q._id !== questionId)
                }));
                toast.success('Question deleted successfully!');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete question';
            toast.error(errorMessage);
        }
    },

    // Clear questions (e.g., on logout)
    clearQuestions: () => set({ questions: [], error: null })
}));

export default useQuestionStore;
