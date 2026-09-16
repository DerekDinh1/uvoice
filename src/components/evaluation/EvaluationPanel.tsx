import type { StyleProfile } from '../../types/styleProfile';
import { useEvaluationStore } from '../../store/useEvaluationStore';
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
  const evaluate = useEvaluationStore((state) => state.evaluate);

  const isEvaluating = status === 'evaluating';

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

      {status === 'idle' && (
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

      {status === 'ready' && sample && result && (
        <div className="space-y-6">
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
              {result.dimensions.map((dimension) => (
                <DimensionScore
                  key={dimension.name}
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
                  {result.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
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
                  {result.recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
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
