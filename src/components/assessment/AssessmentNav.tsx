import { useAppStore } from '../../store/useAppStore';
import { QUESTIONS } from '../../data/questions';

const button =
  'rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function AssessmentNav() {
  const currentIndex = useAppStore((state) => state.currentIndex);
  const next = useAppStore((state) => state.next);
  const previous = useAppStore((state) => state.previous);
  const restartAssessment = useAppStore((state) => state.restartAssessment);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === QUESTIONS.length - 1;

  const handleRestart = () => {
    if (
      window.confirm(
        'Restart the assessment? This permanently clears all your answers.',
      )
    ) {
      restartAssessment();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={previous}
        disabled={isFirst}
        className={`${button} bg-surface-2 text-text hover:opacity-80`}
      >
        Previous
      </button>

      <button
        type="button"
        onClick={handleRestart}
        className={`${button} text-muted hover:text-danger`}
      >
        Restart
      </button>

      <button
        type="button"
        onClick={next}
        disabled={isLast}
        className={`${button} bg-accent text-accent-fg hover:opacity-90`}
      >
        Next
      </button>
    </div>
  );
}
