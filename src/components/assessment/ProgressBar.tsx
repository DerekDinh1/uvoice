import { useAppStore, countAnswered } from '../../store/useAppStore';
import { QUESTIONS } from '../../data/questions';

export function ProgressBar() {
  const currentIndex = useAppStore((state) => state.currentIndex);
  const responses = useAppStore((state) => state.responses);

  const total = QUESTIONS.length;
  const answered = countAnswered(responses);
  const percent = Math.round((answered / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-text">
          Question {currentIndex + 1} of {total}
        </span>
        <span className="text-muted">{answered} answered</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Questions answered"
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
