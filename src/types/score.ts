import { z } from 'zod';

// Shared 0..100 score scale: 0 = very low, 50 = moderate, 100 = very high.
// Model output is coerced and clamped so an out-of-range or stringified
// number never breaks validation. Used by both styleProfileSchema and
// evaluationResultSchema, which score on the same scale.
export const score = z.coerce
  .number()
  .transform((n) =>
    Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0,
  );
