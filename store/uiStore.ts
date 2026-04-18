import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'dark' | 'light';
  compactMode: boolean;
  notificationsEnabled: boolean;
  
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setCompactMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      compactMode: false,
      notificationsEnabled: true,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setCompactMode: (compactMode) => set({ compactMode }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    { name: 'aero-resin-ui' }
  )
);
