interface DimensionScoreProps {
  name: string;
  score: number;
  feedback: string;
}

// A labeled 0..100 score bar plus feedback text for one evaluated dimension.
// A small local counterpart to components/profile/ScoreMeter, kept separate
// so the evaluation panel does not depend on the profile component tree.
export function DimensionScore({ name, score, feedback }: DimensionScoreProps) {
  const percent = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="space-y-1 rounded-md border border-border bg-surface-2 p-3">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-text">{name}</span>
        <span className="text-muted">{percent}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-bg"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-muted">{feedback}</p>
    </div>
  );
}
