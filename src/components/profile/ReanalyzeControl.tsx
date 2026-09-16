import { useAppStore, countAnswered } from '../../store/useAppStore';
import { useAnalysisStore } from '../../store/useAnalysisStore';
import { buttonClass } from '../ui/buttonStyles';

// Re-runs the analysis pipeline against the current assessment answers,
// producing a fresh 'analyzed' entry in the profile's version history below.
// Lives on the Profile page so refining a profile does not require going
// back to the assessment.
export function ReanalyzeControl() {
  const responses = useAppStore((state) => state.responses);
  const status = useAnalysisStore((state) => state.status);
  const error = useAnalysisStore((state) => state.error);
  const analyze = useAnalysisStore((state) => state.analyze);

  const isAnalyzing = status === 'analyzing';
  const hasAnswers = countAnswered(responses) > 0;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-semibold text-text">Re-analyze</h2>
          <p className="max-w-xl text-sm text-muted">
            Run the analysis again on your current answers. This adds a new
            version to the history below and never discards an earlier one.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void analyze(responses)}
          disabled={isAnalyzing || !hasAnswers}
          className={buttonClass('secondary')}
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {!hasAnswers && (
        <p className="text-sm text-muted">
          Answer at least one question on the assessment to re-analyze.
        </p>
      )}

      {status === 'error' && error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
