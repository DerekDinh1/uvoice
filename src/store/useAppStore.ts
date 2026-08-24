import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AssessmentResponse } from '../types/assessment';
import { QUESTIONS } from '../data/questions';
import { STORAGE_KEYS, SCHEMA_VERSION } from '../config';

const LAST_INDEX = QUESTIONS.length - 1;
const clampIndex = (index: number) => Math.min(Math.max(index, 0), LAST_INDEX);

// Assessment slice of the app state. Later phases (profile, prompt, evaluation)
// extend this same persisted store, keeping one versioned LocalStorage envelope.
interface AssessmentState {
  responses: Record<string, AssessmentResponse>;
  currentIndex: number;
  startedAt: number | null;
  completedAt: number | null;
}

interface AssessmentActions {
  setResponse: (questionId: string, text: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  markComplete: () => void;
  restartAssessment: () => void;
}

export type AppStore = AssessmentState & AssessmentActions;

const emptyAssessment = (): AssessmentState => ({
  responses: {},
  currentIndex: 0,
  startedAt: null,
  completedAt: null,
});

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...emptyAssessment(),

      setResponse: (questionId, text) =>
        set((state) => ({
          startedAt: state.startedAt ?? Date.now(),
          responses: {
            ...state.responses,
            [questionId]: { questionId, text, updatedAt: Date.now() },
          },
        })),

      goTo: (index) =>
        set((state) => ({
          currentIndex: clampIndex(index),
          startedAt: state.startedAt ?? Date.now(),
        })),

      next: () => get().goTo(get().currentIndex + 1),
      previous: () => get().goTo(get().currentIndex - 1),

      markComplete: () => set({ completedAt: Date.now() }),

      // Clears only assessment data; uses fresh objects so no reset shares state.
      restartAssessment: () => set(emptyAssessment()),
    }),
    {
      name: STORAGE_KEYS.appState,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Persist data only; actions are re-provided by the store creator.
      partialize: (state) => ({
        responses: state.responses,
        currentIndex: state.currentIndex,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      }),
    },
  ),
);

// Derived helper shared by UI and tests: how many questions have real answers.
export function countAnswered(
  responses: Record<string, AssessmentResponse>,
): number {
  return QUESTIONS.reduce(
    (total, question) =>
      (responses[question.id]?.text ?? '').trim().length > 0
        ? total + 1
        : total,
    0,
  );
}
