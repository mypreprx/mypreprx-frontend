import { create } from 'zustand';
import api from '../config/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Zustand store for managing Manifestation Calendar affirmations
 * Handles CRUD operations for date-specific affirmations
 */
const useAffirmationStore = create((set) => ({
  // State
  affirmations: [],       // affirmations for the currently selected date
  allAffirmations: [],    // every affirmation for the user (across all dates)
  isLoading: false,
  isLoadingAll: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  /**
   * Fetch affirmations for a specific date
   * API: GET /user/affirmation/GetAffirmations?date=YYYY-MM-DD
   * @param {string} dateString - format YYYY-MM-DD
   */
  fetchAffirmationsByDate: async (dateString) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/user/affirmation/GetAffirmations', {
        params: { date: dateString }
      });
      set({ affirmations: response.data.data || [], isLoading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch affirmations';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Fetch ALL affirmations for the logged-in user (across all dates)
   * API: GET /user/affirmation/GetAllAffirmations
   */
  fetchAllAffirmations: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const response = await api.get('/user/affirmation/GetAllAffirmations');
      set({ allAffirmations: response.data.data || [], isLoadingAll: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch affirmations';
      set({ error: errorMessage, isLoadingAll: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Create a new affirmation for a specific date
   * API: POST /user/affirmation/CreateAffirmation
   * @param {string} dateString - format YYYY-MM-DD
   * @param {string} text - the affirmation text
   */
  createAffirmation: async (dateString, text) => {
    set({ isCreating: true, error: null });
    try {
      const response = await api.post('/user/affirmation/CreateAffirmation', {
        date: dateString,
        text
      });
      const newAffirmation = response.data.data;

      set(state => ({
        affirmations: [...state.affirmations, newAffirmation],
        allAffirmations: [newAffirmation, ...state.allAffirmations],
        isCreating: false
      }));

      toast.success('Affirmation saved!');
      return newAffirmation;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save affirmation';
      set({ error: errorMessage, isCreating: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Delete an affirmation by ID
   * API: DELETE /user/affirmation/DeleteAffirmation/:affirmationId
   * @param {string} affirmationId - MongoDB _id of the affirmation
   */
  deleteAffirmation: async (affirmationId) => {
    set({ isDeleting: true, error: null });
    try {
      await api.delete(`/user/affirmation/DeleteAffirmation/${affirmationId}`);

      set(state => ({
        affirmations: state.affirmations.filter(a => a._id !== affirmationId),
        allAffirmations: state.allAffirmations.filter(a => a._id !== affirmationId),
        isDeleting: false
      }));

      toast.success('Affirmation deleted!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete affirmation';
      set({ error: errorMessage, isDeleting: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Update an existing affirmation's text
   * API: PUT /user/affirmation/UpdateAffirmation/:affirmationId
   * @param {string} affirmationId - MongoDB _id
   * @param {string} newText - the updated affirmation text
   */
  updateAffirmation: async (affirmationId, newText, newDate) => {
    set({ isUpdating: true, error: null });
    try {
      const body = { text: newText };
      if (newDate) body.date = newDate;

      const response = await api.put(`/user/affirmation/UpdateAffirmation/${affirmationId}`, body);
      const updated = response.data.data;

      // Patch in-place in both lists
      const patchList = (list) =>
        list.map(a => a._id === affirmationId ? updated : a);

      set(state => ({
        affirmations: patchList(state.affirmations),
        allAffirmations: patchList(state.allAffirmations),
        isUpdating: false
      }));

      toast.success('Affirmation updated!');
      return updated;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update affirmation';
      set({ error: errorMessage, isUpdating: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Clear affirmations (e.g., on logout)
  clearAffirmations: () => set({ affirmations: [], allAffirmations: [], error: null })
}));

export default useAffirmationStore;
