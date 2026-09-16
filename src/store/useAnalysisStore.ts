import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';
import type {
  ProfileVersion,
  ProfileVersionSource,
} from '../types/profileVersion';
import { createVersionId } from '../types/profileVersion';
import { STORAGE_KEYS, SCHEMA_VERSIONS } from '../config';
import { createLLMProvider } from '../lib/llm';
import { analyzeStyle, AnalysisError } from '../services/styleAnalyzer';
import { useSettingsStore } from './useSettingsStore';

export type AnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'error';

// The version history is capped at this many entries and kept newest first
// (index 0 is the most recent), so the oldest entries are the ones dropped
// once the cap is exceeded.
const MAX_VERSIONS = 10;

interface AnalysisStore {
  profile: StyleProfile | null;
  // A signature of the responses the profile was built from, so callers can
  // tell when it has gone stale relative to the current answers.
  profileSignature: string | null;
  // History of saved profiles (Phase 7), newest first, capped at MAX_VERSIONS.
  versions: ProfileVersion[];
  status: AnalysisStatus;
  error: string | null;
  analyze: (responses: Record<string, AssessmentResponse>) => Promise<void>;
  // Replaces the profile with a manually edited one (Phase 4). Does not touch
  // profileSignature: that signature reflects the responses a profile was
  // generated from, not whether it has since been hand-edited. Adds an
  // 'edited' entry to the version history.
  updateProfile: (profile: StyleProfile) => void;
  // Brings a past version back to the front. Adds a new 'restored' entry
  // rather than removing anything, so the version being replaced is never
  // lost. Does not touch profileSignature.
  restoreVersion: (id: string) => void;
  reset: () => void;
}

// Prepends a new version and caps the list at MAX_VERSIONS, dropping the
// oldest entries once it is exceeded.
function pushVersion(
  versions: ProfileVersion[],
  source: ProfileVersionSource,
  profile: StyleProfile,
): ProfileVersion[] {
  const version: ProfileVersion = {
    id: createVersionId(),
    createdAt: Date.now(),
    source,
    profile,
  };
  return [version, ...versions].slice(0, MAX_VERSIONS);
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
      versions: [],
      status: 'idle',
      error: null,

      analyze: async (responses) => {
        set({ status: 'analyzing', error: null });
        const { analysisMode, apiKey } = useSettingsStore.getState();
        const provider = createLLMProvider(analysisMode, { apiKey });
        try {
          const profile = await analyzeStyle(responses, provider);
          set((state) => ({
            profile,
            status: 'ready',
            profileSignature: computeResponsesSignature(responses),
            versions: pushVersion(state.versions, 'analyzed', profile),
          }));
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

      updateProfile: (profile) =>
        set((state) => ({
          profile,
          versions: pushVersion(state.versions, 'edited', profile),
        })),

      restoreVersion: (id) =>
        set((state) => {
          const version = state.versions.find((entry) => entry.id === id);
          if (!version) {
            return state;
          }
          return {
            profile: version.profile,
            versions: pushVersion(state.versions, 'restored', version.profile),
          };
        }),

      reset: () =>
        set({
          profile: null,
          profileSignature: null,
          versions: [],
          status: 'idle',
          error: null,
        }),
    }),
    {
      name: STORAGE_KEYS.analysis,
      version: SCHEMA_VERSIONS.analysis,
      storage: createJSONStorage(() => localStorage),
      // Persist the profile, its signature, and the version history; status
      // and error are per-session.
      partialize: (state) => ({
        profile: state.profile,
        profileSignature: state.profileSignature,
        versions: state.versions,
      }),
    },
  ),
);
