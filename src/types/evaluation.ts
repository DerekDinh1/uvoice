import { z } from 'zod';
import { score } from './score';

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
