import type { LLMProvider } from '../types/llm';
import { LLMError } from '../types/llm';
import type { StyleProfile } from '../types/styleProfile';
import type { EvaluationResult } from '../types/evaluation';
import { evaluationResultSchema } from '../types/evaluation';
import { generateSystemPrompt } from './promptGenerator';
import { buildSamplePrompt } from '../prompts/generationPrompt';
import { buildEvaluationPrompt } from '../prompts/evaluationPrompt';
import { extractJsonObject } from '../lib/json';

// Surfaced to the UI with a human-readable message; wraps provider and
// validation failures alike, mirroring AnalysisError.
export class EvaluationError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EvaluationError';
  }
}

// Asks the provider to write a short sample under the given system prompt.
// Provider failures (network, auth) surface directly as an EvaluationError.
export async function generateSample(
  systemPrompt: string,
  provider: LLMProvider,
  task?: string,
): Promise<string> {
  const request = buildSamplePrompt(systemPrompt, task);
  try {
    const sample = await provider.complete(request);
    return sample.trim();
  } catch (caught) {
    throw new EvaluationError(
      caught instanceof LLMError
        ? caught.message
        : 'Generating a writing sample failed. Please try again.',
      caught,
    );
  }
}

// Runs the evaluation pipeline: prompt -> LLM -> JSON -> validated
// EvaluationResult. A malformed model response is retried once; provider
// failures (network, auth) are not retried.
export async function evaluateSample(
  profile: StyleProfile,
  sample: string,
  provider: LLMProvider,
): Promise<EvaluationResult> {
  const request = buildEvaluationPrompt(profile, sample);
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let raw: string;
    try {
      raw = await provider.complete(request);
    } catch (caught) {
      throw new EvaluationError(
        caught instanceof LLMError
          ? caught.message
          : 'The evaluation request failed. Please try again.',
        caught,
      );
    }

    try {
      return evaluationResultSchema.parse(extractJsonObject(raw));
    } catch (caught) {
      lastError = caught; // malformed output: retry once
    }
  }

  throw new EvaluationError(
    'The evaluation response could not be understood. Please try again.',
    lastError,
  );
}

// Generates a system prompt from the profile, samples a writing task under
// it, then scores that sample against the same profile.
export async function runEvaluation(
  profile: StyleProfile,
  provider: LLMProvider,
): Promise<{ sample: string; result: EvaluationResult }> {
  const systemPrompt = generateSystemPrompt(profile);
  const sample = await generateSample(systemPrompt, provider);
  const result = await evaluateSample(profile, sample, provider);
  return { sample, result };
}
