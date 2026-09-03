import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, SCHEMA_VERSIONS, type ThemeMode } from '../config';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Persisted under its own key so theme is independent of assessment data. The
// inline script in index.html reads this same key to prevent a flash on load.
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: STORAGE_KEYS.theme,
      version: SCHEMA_VERSIONS.theme,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
