import { describe, it, expect } from 'vitest';
import { runEvaluation, evaluateSample, EvaluationError } from './evaluator';
import { MockLLMProvider } from '../lib/llm/mockProvider';
import { LLMError } from '../types/llm';
import type { LLMProvider, LLMRequest } from '../types/llm';
import type { StyleProfile } from '../types/styleProfile';

const profile: StyleProfile = {
  voice: ['Direct'],
  tone: ['Warm'],
  directness: 70,
  formality: 40,
  technicalDepth: 50,
  verbosity: 50,
  humor: 30,
  empathy: 60,
  hedging: 20,
  sentenceStyle: {
    typicalLength: 'Medium',
    complexity: 'Simple',
    rhythm: 'Steady',
  },
  vocabulary: {
    complexity: 'Plain',
    jargon: 'Minimal',
    preferences: ['clear'],
  },
  structure: {
    preferredFormat: ['paragraphs'],
    paragraphStyle: 'Direct',
    bulletUsage: 'Rare',
  },
  explanationStyle: {
    approach: ['examples'],
    examples: true,
    analogies: false,
    reasoning: true,
  },
  tendencies: ['Concise'],
  avoid: ['Jargon'],
};

describe('runEvaluation', () => {
  it('produces a sample and a valid evaluation through the mock provider', async () => {
    const { sample, result } = await runEvaluation(
      profile,
      new MockLLMProvider(),
    );
    expect(sample.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.dimensions.length).toBeGreaterThan(0);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('surfaces a provider error as an EvaluationError', async () => {
    const failing: LLMProvider = {
      id: 'openai',
      complete: () =>
        Promise.reject(new LLMError('Your API key was rejected.')),
    };
    await expect(runEvaluation(profile, failing)).rejects.toBeInstanceOf(
      EvaluationError,
    );
  });
});

describe('evaluateSample', () => {
  it('retries once on malformed output then fails clearly', async () => {
    let calls = 0;
    const garbage: LLMProvider = {
      id: 'mock',
      complete: (request: LLMRequest) => {
        void request;
        calls++;
        return Promise.resolve('not json at all');
      },
    };
    await expect(
      evaluateSample(profile, 'a sample.', garbage),
    ).rejects.toBeInstanceOf(EvaluationError);
    expect(calls).toBe(2);
  });
});
