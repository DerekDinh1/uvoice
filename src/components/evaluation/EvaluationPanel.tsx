import type { StyleProfile } from '../../types/styleProfile';
import { useEvaluationStore } from '../../store/useEvaluationStore';
import { computeProfileSignature } from '../../lib/signature';
import { buttonClass } from '../ui/buttonStyles';
import { DimensionScore } from './DimensionScore';

interface EvaluationPanelProps {
  profile: StyleProfile;
}

// Generates a writing sample under the current system prompt, then scores how
// well that sample matches the target profile. Sits on the Prompt page,
// below the two generated documents.
export function EvaluationPanel({ profile }: EvaluationPanelProps) {
  const status = useEvaluationStore((state) => state.status);
  const error = useEvaluationStore((state) => state.error);
  const sample = useEvaluationStore((state) => state.sample);
  const result = useEvaluationStore((state) => state.result);
  const profileSignature = useEvaluationStore(
    (state) => state.profileSignature,
  );
  const evaluate = useEvaluationStore((state) => state.evaluate);

  const isEvaluating = status === 'evaluating';
  // A sample and result can survive a reload even though `status` resets to
  // 'idle', so whether to show them is driven by whether they exist, not by
  // status (mirrors how AnalyzeBanner drives its own "profile exists" check
  // off data rather than status).
  const hasResult = sample !== null && result !== null;
  // The profile can change (edit, re-analyze, restore) after this evaluation
  // ran, leaving the score attached to a profile that no longer matches. The
  // result stays visible either way; this only decides whether to warn that
  // it may no longer reflect the current profile.
  const isStale =
    hasResult && computeProfileSignature(profile) !== profileSignature;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-semibold text-text">Test and evaluate</h2>
          <p className="text-sm text-muted">
            Generate a writing sample under this system prompt, then check how
            closely it matches your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void evaluate(profile)}
          disabled={isEvaluating}
          className={buttonClass('primary')}
        >
          {isEvaluating ? 'Evaluating...' : 'Generate a sample and score it'}
        </button>
      </div>

      {status === 'idle' && !hasResult && (
        <p className="text-sm text-muted">
          Run this to see how well the system prompt reproduces your writing
          style.
        </p>
      )}

      {status === 'error' && error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {isEvaluating && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-muted"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 animate-pulse rounded-full bg-accent"
          />
          Generating a sample, then scoring it. This can take up to thirty
          seconds.
        </div>
      )}

      {hasResult && sample && result && (
        <div
          aria-busy={isEvaluating}
          className={`space-y-6 transition-opacity ${
            isEvaluating ? 'opacity-50' : ''
          }`}
        >
          {isStale && (
            <p className="rounded-md border border-border bg-surface-2 p-3 text-sm text-muted">
              This evaluation was run against an earlier profile. Re-run it to
              score the current one.
            </p>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text">
              Generated sample
            </h3>
            <p className="rounded-md border border-border bg-bg p-4 text-sm text-text">
              {sample}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text">Overall match</h3>
            <p className="text-3xl font-semibold text-text">
              {result.overallScore}
              <span className="text-base font-normal text-muted">/100</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Dimensions</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.dimensions.map((dimension, index) => (
                <DimensionScore
                  key={`${dimension.name}-${index}`}
                  name={dimension.name}
                  score={dimension.score}
                  feedback={dimension.feedback}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text">Issues</h3>
              {result.issues.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {result.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">None found.</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text">
                Recommendations
              </h3>
              {result.recommendations.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">None suggested.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
