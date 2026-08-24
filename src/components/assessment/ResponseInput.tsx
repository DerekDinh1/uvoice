interface ResponseInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function ResponseInput({ value, onChange }: ResponseInputProps) {
  const characters = value.trim().length;

  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        placeholder="Write your response here..."
        aria-label="Your response"
        className="w-full resize-y rounded-lg border border-border bg-bg p-3 text-sm leading-relaxed text-text shadow-sm outline-none placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <div className="text-right text-xs text-muted">
        {characters} characters
      </div>
    </div>
  );
}
