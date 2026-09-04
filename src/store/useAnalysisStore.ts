import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';
import { STORAGE_KEYS, SCHEMA_VERSIONS } from '../config';
import { createLLMProvider } from '../lib/llm';
import { analyzeStyle, AnalysisError } from '../services/styleAnalyzer';
import { useSettingsStore } from './useSettingsStore';

export type AnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'error';

interface AnalysisStore {
  profile: StyleProfile | null;
  // A signature of the responses the profile was built from, so callers can
  // tell when it has gone stale relative to the current answers.
  profileSignature: string | null;
  status: AnalysisStatus;
  error: string | null;
  analyze: (responses: Record<string, AssessmentResponse>) => Promise<void>;
  // Replaces the profile with a manually edited one (Phase 4). Does not touch
  // profileSignature: that signature reflects the responses a profile was
  // generated from, not whether it has since been hand-edited.
  updateProfile: (profile: StyleProfile) => void;
  reset: () => void;
}

// Cheap, deterministic signature of a set of responses. Used to detect when
// answers changed since a profile was generated, without storing the answers
// themselves a second time. Lives here (not on useAppStore) so the assessment
// store never has to know about analysis.
export function computeResponsesSignature(
  responses: Record<string, AssessmentResponse>,
): string {
  return Object.keys(responses)
    .sort()
    .map((id) => `${id}:${responses[id].text.trim().length}`)
    .join('|');
}

// Holds the generated profile (persisted) plus transient analysis status. The
// provider is chosen from settings when analysis runs.
export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      profile: null,
      profileSignature: null,
      status: 'idle',
      error: null,

      analyze: async (responses) => {
        set({ status: 'analyzing', error: null });
        const { analysisMode, apiKey } = useSettingsStore.getState();
        const provider = createLLMProvider(analysisMode, { apiKey });
        try {
          const profile = await analyzeStyle(responses, provider);
          set({
            profile,
            status: 'ready',
            profileSignature: computeResponsesSignature(responses),
          });
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

      updateProfile: (profile) => set({ profile }),

      reset: () =>
        set({
          profile: null,
          profileSignature: null,
          status: 'idle',
          error: null,
        }),
    }),
    {
      name: STORAGE_KEYS.analysis,
      version: SCHEMA_VERSIONS.analysis,
      storage: createJSONStorage(() => localStorage),
      // Persist the profile and its signature only; status and error are
      // per-session.
      partialize: (state) => ({
        profile: state.profile,
        profileSignature: state.profileSignature,
      }),
    },
  ),
);
