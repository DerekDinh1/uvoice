interface ScoreMeterProps {
  label: string;
  score: number;
}

// A labeled 0..100 score bar, sharing the visual language of the assessment
// progress bar so scores read consistently across the app.
export function ScoreMeter({ label, score }: ScoreMeterProps) {
  const percent = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="text-muted">{percent}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
