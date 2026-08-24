interface PagePlaceholderProps {
  title: string;
  phase: string;
  description: string;
}

// Shared placeholder used by not-yet-built pages during phased development.
export function PagePlaceholder({
  title,
  phase,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {title}
        </h1>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
          {phase}
        </span>
      </div>
      <p className="max-w-xl text-muted">{description}</p>
      <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        Coming in {phase}.
      </div>
    </section>
  );
}
