import { create } from 'zustand';
import { getStatuses, createStatus, viewStatus, deleteStatus } from '../services/status.service';

export const useStatusStore = create((set, get) => ({
    statuses: [],
    isStatusLoading: false,

    fetchStatuses: async () => {
        try {
            set({ isStatusLoading: true });
            const res = await getStatuses();
            // Backend returns array of users with their statuses
            set({ statuses: res.data || [] });
        } catch (error) {
            console.error('Error fetching statuses:', error);
        } finally {
            set({ isStatusLoading: false });
        }
    },

    uploadNewStatus: async (formData) => {
        try {
            const res = await createStatus(formData);
            // Re-fetch after upload to get the updated structured list
            await get().fetchStatuses();
            return res.data;
        } catch (error) {
            console.error('Error uploading status:', error);
            throw error;
        }
    },

    markStatusAsViewed: async (statusId) => {
        try {
            await viewStatus(statusId);
        } catch (error) {
            console.error('Error viewing status:', error);
        }
    },

    deleteMyStatus: async (statusId) => {
        try {
            await deleteStatus(statusId);
            await get().fetchStatuses();
        } catch (error) {
            console.error('Error deleting status:', error);
            throw error;
        }
    }
}));
