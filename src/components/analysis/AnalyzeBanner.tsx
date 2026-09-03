import { Link } from 'react-router-dom';
import type { AssessmentResponse } from '../../types/assessment';
import { useAnalysisStore } from '../../store/useAnalysisStore';
import { ROUTES } from '../../config';
import { buttonClass } from '../ui/buttonStyles';

interface AnalyzeBannerProps {
  responses: Record<string, AssessmentResponse>;
}

// Shown once every question is answered: runs the analysis pipeline and reflects
// its status. The profile itself is rendered on the Profile screen (Phase 4).
export function AnalyzeBanner({ responses }: AnalyzeBannerProps) {
  const status = useAnalysisStore((state) => state.status);
  const error = useAnalysisStore((state) => state.error);
  const analyze = useAnalysisStore((state) => state.analyze);

  const isAnalyzing = status === 'analyzing';

  return (
    <div className="space-y-3 rounded-md bg-success-bg px-4 py-4">
      <p className="text-sm text-success-text">
        All questions answered. Analyze your responses to build a writing-style
        profile.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => analyze(responses)}
          disabled={isAnalyzing}
          className={buttonClass('primary', 'px-4 py-2')}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze my writing style'}
        </button>

        {status === 'ready' && (
          <Link
            to={ROUTES.profile}
            className="text-sm font-medium text-success-text underline"
          >
            Your profile is ready. View it.
          </Link>
        )}
      </div>

      {status === 'error' && error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
