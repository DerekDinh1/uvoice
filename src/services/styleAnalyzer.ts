import type { LLMProvider } from '../types/llm';
import { LLMError } from '../types/llm';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';
import { styleProfileSchema } from '../types/styleProfile';
import { QUESTIONS } from '../data/questions';
import { buildAnalysisPrompt, type WritingSample } from '../prompts/analysisPrompt';
import { extractJsonObject } from '../lib/json';

// Surfaced to the UI with a human-readable message; wraps provider and
// validation failures alike.
export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Turns stored responses into labeled writing samples, dropping empty answers.
export function toWritingSamples(
  responses: Record<string, AssessmentResponse>,
): WritingSample[] {
  return QUESTIONS.map((question) => ({
    title: question.title,
    prompt: question.prompt,
    answer: (responses[question.id]?.text ?? '').trim(),
  })).filter((sample) => sample.answer.length > 0);
}

// Runs the analysis pipeline: normalize -> prompt -> LLM -> JSON -> validated
// StyleProfile. A malformed model response is retried once; provider failures
// (network, auth) are not retried.
export async function analyzeStyle(
  responses: Record<string, AssessmentResponse>,
  provider: LLMProvider,
): Promise<StyleProfile> {
  const samples = toWritingSamples(responses);
  if (samples.length === 0) {
    throw new AnalysisError('Answer at least one question before analyzing.');
  }

  const request = buildAnalysisPrompt(samples);
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let raw: string;
    try {
      raw = await provider.complete(request);
    } catch (caught) {
      throw new AnalysisError(
        caught instanceof LLMError
          ? caught.message
          : 'The analysis request failed. Please try again.',
        caught,
      );
    }

    try {
      return styleProfileSchema.parse(extractJsonObject(raw));
    } catch (caught) {
      lastError = caught; // malformed output: retry once
    }
  }

  throw new AnalysisError(
    'The analysis response could not be understood. Please try again.',
    lastError,
  );
}
