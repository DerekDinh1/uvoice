import type { LLMRequest } from '../types/llm';

export interface WritingSample {
  title: string;
  prompt: string;
  answer: string;
}

// The schema the model must return, described in words. Kept in sync with
// styleProfileSchema; the response is validated against that schema regardless.
const SCHEMA_GUIDE = `Return ONLY a JSON object with exactly these keys:
- voice: string[] (e.g. "Direct", "Conversational")
- tone: string[]
- directness, formality, technicalDepth, verbosity, humor, empathy, hedging:
  numbers 0-100 (0 = very low, 50 = moderate, 100 = very high)
- sentenceStyle: { typicalLength: string, complexity: string, rhythm: string }
- vocabulary: { complexity: string, jargon: string, preferences: string[] }
- structure: { preferredFormat: string[], paragraphStyle: string, bulletUsage: string }
- explanationStyle: { approach: string[], examples: boolean, analogies: boolean, reasoning: boolean }
- tendencies: string[] (habits this writer shows)
- avoid: string[] (things this writer does not do, to preserve their voice)
No prose, no code fences, JSON only.`;

export function buildAnalysisPrompt(samples: WritingSample[]): LLMRequest {
  const system = [
    'You are an expert writing analyst. You are given several short samples',
    'written by one person in different modes. Infer their natural writing',
    'style: voice, tone, sentence and vocabulary habits, structure, and the',
    'things they consistently do and avoid. Base every judgement on the',
    'samples, not on assumptions.',
    '',
    SCHEMA_GUIDE,
  ].join('\n');

  const user = samples
    .map(
      (sample, index) =>
        `## Sample ${index + 1}: ${sample.title}\n` +
        `Prompt: ${sample.prompt}\n` +
        `Response:\n${sample.answer}`,
    )
    .join('\n\n');

  return { system, user };
}
