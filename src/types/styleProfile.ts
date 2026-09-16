import { z } from 'zod';
import { score } from './score';

export const styleProfileSchema = z.object({
  voice: z.array(z.string()),
  tone: z.array(z.string()),

  directness: score,
  formality: score,
  technicalDepth: score,
  verbosity: score,
  humor: score,
  empathy: score,
  hedging: score,

  sentenceStyle: z.object({
    typicalLength: z.string(),
    complexity: z.string(),
    rhythm: z.string(),
  }),
  vocabulary: z.object({
    complexity: z.string(),
    jargon: z.string(),
    preferences: z.array(z.string()),
  }),
  structure: z.object({
    preferredFormat: z.array(z.string()),
    paragraphStyle: z.string(),
    bulletUsage: z.string(),
  }),
  explanationStyle: z.object({
    approach: z.array(z.string()),
    examples: z.boolean(),
    analogies: z.boolean(),
    reasoning: z.boolean(),
  }),

  tendencies: z.array(z.string()),
  avoid: z.array(z.string()),
});

export type StyleProfile = z.infer<typeof styleProfileSchema>;

// Keys of StyleProfile whose value is a number, i.e. every score dimension.
// Lets STYLE_DIMENSIONS (and anything typed against it) reference only a
// numeric field, without a runtime-unsafe `as number` cast at each use site.
export type NumericStyleProfileKey = {
  [K in keyof StyleProfile]: StyleProfile[K] extends number ? K : never;
}[keyof StyleProfile];

// The numeric dimensions, in display order. Used by the profile UI (Phase 4) and
// the prompt generator (Phase 5) so the set of scores is defined in one place.
export const STYLE_DIMENSIONS = [
  { key: 'directness', label: 'Directness' },
  { key: 'formality', label: 'Formality' },
  { key: 'technicalDepth', label: 'Technical depth' },
  { key: 'verbosity', label: 'Verbosity' },
  { key: 'humor', label: 'Humor' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'hedging', label: 'Hedging' },
] as const satisfies ReadonlyArray<{
  key: NumericStyleProfileKey;
  label: string;
}>;

export interface StyleDimension {
  key: NumericStyleProfileKey;
  label: string;
  score: number;
}
