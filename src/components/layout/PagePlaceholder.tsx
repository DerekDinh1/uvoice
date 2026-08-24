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
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {phase}
        </span>
      </div>
      <p className="max-w-xl text-slate-600">{description}</p>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        Coming in {phase}.
      </div>
    </section>
  );
}
