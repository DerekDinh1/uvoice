import type { LLMRequest } from '../types/llm';
import type { StyleProfile } from '../types/styleProfile';
import { generateStyleProfileDoc } from '../services/promptGenerator';

// The schema the model must return, described in words. Kept in sync with
// evaluationResultSchema; the response is validated against that schema
// regardless.
const SCHEMA_GUIDE = `Return ONLY a JSON object with exactly these keys:
- overallScore: number 0-100 (0 = does not match the profile at all, 100 = a perfect match)
- dimensions: array of objects, each with:
  - name: string (e.g. "Directness", "Formality", "Sentence style")
  - score: number 0-100 for how well the sample matches that dimension
  - feedback: string, one or two sentences explaining the score
- issues: string[] (specific ways the sample drifts from the target profile)
- recommendations: string[] (specific, actionable changes that would close the gap)
No prose, no code fences, JSON only.`;

// Builds a request that asks the model to judge how well a writing sample
// embodies a target style profile, returning a structured EvaluationResult.
export function buildEvaluationPrompt(
  profile: StyleProfile,
  sample: string,
): LLMRequest {
  const system = [
    'You are an exacting writing judge. You are given a target writing-style',
    'profile and a sample of text written under a prompt derived from that',
    'profile. Score how well the sample actually embodies the profile, on a',
    '0-100 scale: 0 means the sample does not match the profile, 100 means it',
    'matches perfectly. Base every judgement on the sample text itself, not',
    'on assumptions about what a good sample should look like.',
    '',
    SCHEMA_GUIDE,
  ].join('\n');

  const user = [
    '## Target Profile',
    generateStyleProfileDoc(profile),
    '',
    '## Sample to Evaluate',
    sample,
  ].join('\n');

  return { system, user, purpose: 'evaluation', responseFormat: 'json' };
}
