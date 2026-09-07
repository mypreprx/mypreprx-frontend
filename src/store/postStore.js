import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Zustand store for managing Weekly Wins (Motivation Monday) posts
 * Handles fetching, creating, liking, and commenting on posts
 */
const usePostStore = create((set, get) => ({
    // State
    posts: [],
    isLoading: false,
    isCreatingPost: false,
    error: null,

    /**
     * Fetch all posts from the server
     * API: GET /user/getallPosts
     */
    fetchPosts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/user/getallPosts');
            set({ posts: response.data.posts || [], isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch posts';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    /**
     * Create a new post with optional image
     * API: POST /user/sharePost (multipart/form-data for image upload)
     * @param {string} content - Text content of the post
     * @param {File|null} imageFile - Optional image file
     * @param {Object} currentUser - Current logged-in user object for immediate display
     */
    createPost: async (content, imageFile = null, currentUser = null) => {
        set({ isCreatingPost: true, error: null });
        try {
            // Use FormData for file upload support
            const formData = new FormData();
            formData.append('content', content);
            if (imageFile) {
                formData.append('file', imageFile);
            }

            const response = await api.post('/user/sharePost', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Add new post to the beginning of posts array
            // Inject current user info since backend returns unpopulated author
            const newPost = {
                ...response.data.post,
                author: currentUser ? { _id: currentUser._id, username: currentUser.username, email: currentUser.email } : response.data.post.author
            };
            set(state => ({
                posts: [newPost, ...state.posts],
                isCreatingPost: false
            }));

            toast.success('Post shared successfully!');
            return newPost;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create post';
            set({ error: errorMessage, isCreatingPost: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Toggle like on a post
     * API: GET /user/like/:postid
     * @param {string} postId - ID of the post to like/unlike
     */
    toggleLike: async (postId) => {
        try {
            const response = await api.get(`/user/like/${postId}`);
            const updatedLikes = response.data.likes;

            // Update the specific post's likes in state
            set(state => ({
                posts: state.posts.map(post =>
                    post._id === postId ? { ...post, likes: updatedLikes } : post
                )
            }));
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Failed to update like';
            toast.error(errorMessage);
        }
    },

    /**
     * Add a comment to a post
     * API: POST /user/comment/:postid
     * @param {string} postId - ID of the post to comment on
     * @param {string} commentText - Comment text
     * @param {Object} currentUser - Current logged-in user object for immediate display
     */
    addComment: async (postId, commentText, currentUser = null) => {
        try {
            const response = await api.post(`/user/comment/${postId}`, {
                comment: commentText
            });
            const updatedComments = response.data.comments;

            // Inject current user info into the first comment (newest) since backend returns unpopulated user
            const commentsWithUser = updatedComments.map((comment, index) => {
                // The first comment is the newly added one (backend uses unshift)
                if (index === 0 && currentUser && !comment.user?.username) {
                    return {
                        ...comment,
                        user: { _id: currentUser._id, username: currentUser.username, email: currentUser.email }
                    };
                }
                return comment;
            });

            // Update the specific post's comments in state
            set(state => ({
                posts: state.posts.map(post =>
                    post._id === postId ? { ...post, comments: commentsWithUser } : post
                )
            }));

            toast.success('Comment added!');
            return commentsWithUser;
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Failed to add comment';
            toast.error(errorMessage);
            throw error;
        }
    },

    // Clear all posts (e.g., on logout)
    clearPosts: () => set({ posts: [], error: null })
}));

export default usePostStore;
