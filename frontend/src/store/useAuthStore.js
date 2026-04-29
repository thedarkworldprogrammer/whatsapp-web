import { create } from 'zustand';
import { checkUserAuth, logoutUser, updateUserProfile } from '../services/user.service';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,

    checkAuth: async () => {
        try {
            set({ isCheckingAuth: true });
            const res = await checkUserAuth();
            if (res.isAuthenticated) {
                set({ authUser: res.user, isAuthenticated: true });
            } else {
                set({ authUser: null, isAuthenticated: false });
            }
        } catch (error) {
            set({ authUser: null, isAuthenticated: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    setAuthUser: (user) => {
        set({ authUser: user, isAuthenticated: !!user });
    },

    updateProfile: async (data) => {
        try {
            set({ isUpdatingProfile: true });
            const res = await updateUserProfile(data);
            set({ authUser: res.data });
            return res;
        } catch (error) {
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    logout: async () => {
        try {
            await logoutUser();
            set({ authUser: null, isAuthenticated: false });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}));
