import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StyleProfile } from '../types/styleProfile';
import type { EvaluationResult } from '../types/evaluation';
import { STORAGE_KEYS, SCHEMA_VERSIONS } from '../config';
import { createLLMProvider } from '../lib/llm';
import { runEvaluation, EvaluationError } from '../services/evaluator';
import { computeProfileSignature } from '../lib/signature';
import { useSettingsStore } from './useSettingsStore';

export type EvaluationStatus = 'idle' | 'evaluating' | 'ready' | 'error';

interface EvaluationStore {
  sample: string | null;
  result: EvaluationResult | null;
  // A signature of the profile the result was scored against, so callers can
  // tell when it has gone stale relative to the current profile (an edit,
  // re-analysis, or restore since this evaluation ran).
  profileSignature: string | null;
  status: EvaluationStatus;
  error: string | null;
  evaluate: (profile: StyleProfile) => Promise<void>;
  reset: () => void;
}

// Holds the generated sample and its evaluation (persisted) plus transient
// status. The provider is chosen from settings, the same as useAnalysisStore.
export const useEvaluationStore = create<EvaluationStore>()(
  persist(
    (set) => ({
      sample: null,
      result: null,
      profileSignature: null,
      status: 'idle',
      error: null,

      evaluate: async (profile) => {
        set({ status: 'evaluating', error: null });
        const { analysisMode, apiKey } = useSettingsStore.getState();
        const provider = createLLMProvider(analysisMode, { apiKey });
        try {
          const { sample, result } = await runEvaluation(profile, provider);
          set({
            sample,
            result,
            profileSignature: computeProfileSignature(profile),
            status: 'ready',
          });
        } catch (caught) {
          set({
            status: 'error',
            error:
              caught instanceof EvaluationError
                ? caught.message
                : 'Evaluation failed. Please try again.',
          });
        }
      },

      reset: () =>
        set({
          sample: null,
          result: null,
          profileSignature: null,
          status: 'idle',
          error: null,
        }),
    }),
    {
      name: STORAGE_KEYS.evaluation,
      version: SCHEMA_VERSIONS.evaluation,
      storage: createJSONStorage(() => localStorage),
      // Persist the sample, result, and profile signature; status and error
      // are per-session.
      partialize: (state) => ({
        sample: state.sample,
        result: state.result,
        profileSignature: state.profileSignature,
      }),
    },
  ),
);
