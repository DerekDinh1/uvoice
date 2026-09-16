import type { StyleProfile } from '../types/styleProfile';

// Deterministic string built from every field in a profile, so it changes
// whenever the profile does (analysis, manual edit, or restore) regardless of
// key insertion order. Used to detect when a stored artifact (e.g. an
// evaluation result) was produced against a profile that has since changed,
// the same way computeResponsesSignature in useAnalysisStore detects stale
// analyses against edited answers.
export function computeProfileSignature(profile: StyleProfile): string {
  return stableStringify(profile);
}

// JSON.stringify with object keys sorted recursively, so two objects holding
// the same data in a different key order produce the same string. Arrays
// keep their order, since order is meaningful there (e.g. voice, tendencies).
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => {
        const propertyValue = (value as Record<string, unknown>)[key];
        return `${JSON.stringify(key)}:${stableStringify(propertyValue)}`;
      });
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}
