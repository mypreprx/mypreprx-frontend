import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Zustand store for managing Scripting Space notes
 * Handles CRUD operations for personal scripts/notes
 */
const useScriptStore = create((set, get) => ({
    // State
    scripts: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    /**
     * Fetch all notes for the logged-in user
     * API: GET /user/getallNotes
     */
    fetchScripts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/user/getallNotes');
            set({ scripts: response.data.notes || [], isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch scripts';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    /**
     * Create a new script/note
     * API: POST /user/createNote
     * @param {string} content - Content of the script
     * @param {string} title - Optional title (defaults to 'Untitled Note' on backend)
     */
    createScript: async (content, title = '') => {
        set({ isCreating: true, error: null });
        try {
            const response = await api.post('/user/createNote', { content, title });
            const newScript = response.data.note;

            // Add new script to the beginning of the list
            set(state => ({
                scripts: [newScript, ...state.scripts],
                isCreating: false
            }));

            toast.success('Script saved successfully!');
            return newScript;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save script';
            set({ error: errorMessage, isCreating: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Update an existing script/note
     * API: POST /user/updateNote/:noteid
     * @param {string} noteId - ID of the note to update
     * @param {string} content - Updated content
     * @param {string} title - Updated title (optional)
     */
    updateScript: async (noteId, content, title = '') => {
        set({ isUpdating: true, error: null });
        try {
            const response = await api.post(`/user/updateNote/${noteId}`, { content, title });
            const updatedScript = response.data.note;

            // Update the script in state
            set(state => ({
                scripts: state.scripts.map(script =>
                    script._id === noteId ? updatedScript : script
                ),
                isUpdating: false
            }));

            toast.success('Script updated successfully!');
            return updatedScript;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update script';
            set({ error: errorMessage, isUpdating: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    /**
     * Delete a script/note
     * API: GET /user/deleteNote/:noteid
     * @param {string} noteId - ID of the note to delete
     */
    deleteScript: async (noteId) => {
        set({ isDeleting: true, error: null });
        try {
            await api.get(`/user/deleteNote/${noteId}`);

            // Remove script from state
            set(state => ({
                scripts: state.scripts.filter(script => script._id !== noteId),
                isDeleting: false
            }));

            toast.success('Script deleted successfully!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete script';
            set({ error: errorMessage, isDeleting: false });
            toast.error(errorMessage);
            throw error;
        }
    },

    // Clear all scripts (e.g., on logout)
    clearScripts: () => set({ scripts: [], error: null })
}));

export default useScriptStore;
