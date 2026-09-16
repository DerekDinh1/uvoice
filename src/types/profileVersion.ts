import type { StyleProfile } from './styleProfile';

// Where a saved version came from. 'analyzed' is a fresh run of the analysis
// pipeline, 'edited' is a manual save from the profile editor, and 'restored'
// marks the moment an older version was brought back to the front.
export type ProfileVersionSource = 'analyzed' | 'edited' | 'restored';

export interface ProfileVersion {
  id: string;
  createdAt: number;
  source: ProfileVersionSource;
  profile: StyleProfile;
}

// Generates a version id. Prefers crypto.randomUUID(); falls back to a
// timestamp plus a random suffix for environments where it is unavailable.
export function createVersionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
