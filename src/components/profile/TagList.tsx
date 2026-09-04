interface TagListProps {
  items: string[];
}

// Renders a short list of strings (voice, tone, tendencies, things to avoid)
// as compact pills. Reused across every profile section that shows one.
export function TagList({ items }: TagListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing recorded.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
