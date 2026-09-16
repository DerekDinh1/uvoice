import { z } from 'zod';

// Same 0..100 scale and coercion as styleProfileSchema's score field, defined
// locally so this module does not reach into styleProfile internals.
const score = z.coerce
  .number()
  .transform((n) =>
    Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0,
  );

export const evaluationResultSchema = z.object({
  overallScore: score,
  dimensions: z.array(
    z.object({
      name: z.string(),
      score: score,
      feedback: z.string(),
    }),
  ),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
