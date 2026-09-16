import type { ProfileDiff } from '../../lib/profileDiff';

interface ProfileDiffViewProps {
  diff: ProfileDiff;
}

// Renders a profileDiff: score changes with their before and after values and
// a direction, added and removed tags, and changed text or boolean fields.
// Fields with no change are left out, since a diff view only needs to draw
// attention to what moved.
export function ProfileDiffView({ diff }: ProfileDiffViewProps) {
  const changedScores = diff.scores.filter((score) => score.delta !== 0);
  const hasChanges =
    changedScores.length > 0 ||
    diff.tagFields.length > 0 ||
    diff.textFields.length > 0 ||
    diff.booleanFields.length > 0;

  if (!hasChanges) {
    return (
      <p className="text-sm text-muted">
        No differences between these two versions.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border bg-bg p-4">
      {changedScores.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text">Score changes</h3>
          <ul className="space-y-1 text-sm">
            {changedScores.map((score) => (
              <li
                key={score.key}
                className="flex flex-wrap items-center justify-between gap-x-3"
              >
                <span className="text-text">{score.label}</span>
                <span
                  className={
                    score.delta > 0 ? 'text-success-text' : 'text-danger'
                  }
                >
                  {score.before} to {score.after} ({score.delta > 0 ? '+' : ''}
                  {score.delta}, {score.delta > 0 ? 'up' : 'down'})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.tagFields.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text">Tag changes</h3>
          <ul className="space-y-2 text-sm">
            {diff.tagFields.map((field) => (
              <li key={field.field} className="space-y-0.5">
                <p className="font-medium text-text">{field.label}</p>
                {field.added.length > 0 && (
                  <p className="text-success-text">
                    Added: {field.added.join(', ')}
                  </p>
                )}
                {field.removed.length > 0 && (
                  <p className="text-danger">
                    Removed: {field.removed.join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.textFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text">Field changes</h3>
          <ul className="space-y-1 text-sm">
            {diff.textFields.map((field) => (
              <li key={field.field} className="text-text">
                <span className="font-medium">{field.label}:</span>{' '}
                <span className="text-muted">{field.before}</span> to{' '}
                <span className="text-text">{field.after}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.booleanFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text">Setting changes</h3>
          <ul className="space-y-1 text-sm">
            {diff.booleanFields.map((field) => (
              <li key={field.field} className="text-text">
                <span className="font-medium">{field.label}:</span>{' '}
                {field.before ? 'Yes' : 'No'} to {field.after ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
