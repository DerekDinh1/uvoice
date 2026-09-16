import { useState } from 'react';
import type { ProfileVersionSource } from '../../types/profileVersion';
import { useAnalysisStore } from '../../store/useAnalysisStore';
import { profileDiff } from '../../lib/profileDiff';
import { buttonClass } from '../ui/buttonStyles';
import { ProfileDiffView } from './ProfileDiffView';

const SOURCE_LABELS: Record<ProfileVersionSource, string> = {
  analyzed: 'Analyzed',
  edited: 'Edited',
  restored: 'Restored',
};

function formatTimestamp(createdAt: number): string {
  return new Date(createdAt).toLocaleString();
}

// Lists saved profile versions (newest first), lets the user compare any two
// of them, and restores an older one back to the front. Versions accumulate
// from re-analysis, manual edits, and restores themselves; the store caps the
// list at the 10 most recent.
export function VersionHistoryPanel() {
  const versions = useAnalysisStore((state) => state.versions);
  const restoreVersion = useAnalysisStore((state) => state.restoreVersion);

  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  // Tracks the fresh 'restored' entry created by the most recent restore, so
  // the list can call out which version is now current. Restoring's only
  // other visible effect is ProfileView, above this panel, which can be
  // off-screen on mobile, so this also drives the aria-live confirmation
  // below. The badge below only shows while that entry is still versions[0]:
  // a later analysis or edit pushes a new head, and the restored entry is no
  // longer current even though it is still the one this component remembers.
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  if (versions.length === 0) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">History</h2>
        <p className="text-sm text-muted">
          No saved versions yet. Analyzing or editing your profile adds one
          here.
        </p>
      </div>
    );
  }

  // Default to comparing the two most recent versions, falling back to the
  // defaults whenever a selected id no longer exists in the list.
  const fromVersion =
    versions.find((version) => version.id === fromId) ??
    versions[1] ??
    versions[0];
  const toVersion =
    versions.find((version) => version.id === toId) ?? versions[0];
  const canCompare = versions.length >= 2;
  const diff = canCompare
    ? profileDiff(fromVersion.profile, toVersion.profile)
    : null;

  const handleRestore = (id: string, createdAt: number) => {
    restoreVersion(id);
    // restoreVersion prepends a fresh 'restored' entry, so the version that
    // is now current is the new versions[0], not the one that was clicked.
    const current = useAnalysisStore.getState().versions[0];
    setRestoredId(current?.id ?? null);
    setAnnouncement(`Restored the version from ${formatTimestamp(createdAt)}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-text">History</h2>
        <p className="text-sm text-muted">
          Every analysis, edit, and restore is saved here. Compare two versions
          or bring an older one back.
        </p>
      </div>

      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      {canCompare && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="compare-from-version"
                className="block text-sm font-medium text-text"
              >
                Compare from
              </label>
              <select
                id="compare-from-version"
                value={fromVersion.id}
                onChange={(event) => setFromId(event.target.value)}
                className="w-full rounded-md border border-border bg-bg p-2 text-sm text-text"
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {formatTimestamp(version.createdAt)} (
                    {SOURCE_LABELS[version.source]})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="compare-to-version"
                className="block text-sm font-medium text-text"
              >
                Compare to
              </label>
              <select
                id="compare-to-version"
                value={toVersion.id}
                onChange={(event) => setToId(event.target.value)}
                className="w-full rounded-md border border-border bg-bg p-2 text-sm text-text"
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {formatTimestamp(version.createdAt)} (
                    {SOURCE_LABELS[version.source]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {diff && <ProfileDiffView diff={diff} />}
        </div>
      )}

      <ul className="space-y-2">
        {versions.map((version) => (
          <li
            key={version.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-4 py-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-text">
                {formatTimestamp(version.createdAt)}
              </p>
              <span className="inline-flex flex-wrap gap-1.5">
                <span className="inline-block rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted">
                  {SOURCE_LABELS[version.source]}
                </span>
                {version.id === restoredId && version.id === versions[0].id && (
                  <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg">
                    Current
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRestore(version.id, version.createdAt)}
              className={buttonClass('outline', 'px-3 py-1.5')}
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
