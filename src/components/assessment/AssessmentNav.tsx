import { useAppStore } from '../../store/useAppStore';
import { QUESTIONS } from '../../data/questions';
import { resetSession } from '../../lib/resetSession';
import { buttonClass } from '../ui/buttonStyles';

export function AssessmentNav() {
  const currentIndex = useAppStore((state) => state.currentIndex);
  const next = useAppStore((state) => state.next);
  const previous = useAppStore((state) => state.previous);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === QUESTIONS.length - 1;

  const handleRestart = () => {
    if (
      window.confirm(
        'Restart the assessment? This permanently clears your answers, your profile, and your latest results.',
      )
    ) {
      resetSession();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={previous}
        disabled={isFirst}
        className={buttonClass('secondary')}
      >
        Previous
      </button>

      <button
        type="button"
        onClick={handleRestart}
        className={buttonClass('ghost')}
      >
        Restart
      </button>

      <button
        type="button"
        onClick={next}
        disabled={isLast}
        className={buttonClass('primary')}
      >
        Next
      </button>
    </div>
  );
}
