interface ScoreSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

// A labeled 0..100 range input, the editable counterpart to ScoreMeter. The
// native range input reports aria-valuenow/min/max itself, so no manual aria
// wiring is needed.
export function ScoreSlider({ id, label, value, onChange }: ScoreSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id} className="font-medium text-text">
          {label}
        </label>
        <span className="text-muted">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
