import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem('whatsapp-theme') || 'light',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('whatsapp-theme', newTheme);
        return { theme: newTheme };
    }),
    setTheme: (theme) => {
        localStorage.setItem('whatsapp-theme', theme);
        set({ theme });
    }
}));
