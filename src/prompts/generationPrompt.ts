import type { LLMRequest } from '../types/llm';

// A neutral writing task used when the caller does not supply one. Picked to
// be concrete enough to produce a real paragraph, not a one-line answer.
const DEFAULT_TASK =
  'Explain, in your own words, why code review matters on a software team.';

// Builds a request that asks the model to write a short sample under the
// given system prompt. The sample is later checked against the profile that
// produced the prompt.
export function buildSamplePrompt(
  systemPrompt: string,
  task: string = DEFAULT_TASK,
): LLMRequest {
  return {
    system: systemPrompt,
    user: task,
    purpose: 'generation',
    responseFormat: 'text',
  };
}
