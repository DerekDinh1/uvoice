import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';
import { STORAGE_KEYS, SCHEMA_VERSION } from '../config';
import { createLLMProvider } from '../lib/llm';
import { analyzeStyle, AnalysisError } from '../services/styleAnalyzer';
import { useSettingsStore } from './useSettingsStore';

export type AnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'error';

interface AnalysisStore {
  profile: StyleProfile | null;
  status: AnalysisStatus;
  error: string | null;
  analyze: (responses: Record<string, AssessmentResponse>) => Promise<void>;
  reset: () => void;
}

// Holds the generated profile (persisted) plus transient analysis status. The
// provider is chosen from settings when analysis runs.
export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      profile: null,
      status: 'idle',
      error: null,

      analyze: async (responses) => {
        set({ status: 'analyzing', error: null });
        const { analysisMode, apiKey } = useSettingsStore.getState();
        const provider = createLLMProvider(analysisMode, { apiKey });
        try {
          const profile = await analyzeStyle(responses, provider);
          set({ profile, status: 'ready' });
        } catch (caught) {
          set({
            status: 'error',
            error:
              caught instanceof AnalysisError
                ? caught.message
                : 'Analysis failed. Please try again.',
          });
        }
      },

      reset: () => set({ profile: null, status: 'idle', error: null }),
    }),
    {
      name: STORAGE_KEYS.analysis,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Persist the profile only; status and error are per-session.
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
