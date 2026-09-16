import { useAppStore } from '../store/useAppStore';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { useEvaluationStore } from '../store/useEvaluationStore';

// Clears every piece of session state at once: the assessment answers, the
// derived profile and its version history, and the last evaluation.
// useAppStore.restartAssessment alone only cleared the assessment, leaving
// the profile and evaluation behind as if "restart" had not touched them.
export function resetSession(): void {
  useAppStore.getState().restartAssessment();
  useAnalysisStore.getState().reset();
  useEvaluationStore.getState().reset();
}
