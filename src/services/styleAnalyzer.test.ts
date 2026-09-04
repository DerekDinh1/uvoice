import { describe, it, expect } from 'vitest';
import { analyzeStyle, AnalysisError, toWritingSamples } from './styleAnalyzer';
import { MockLLMProvider } from '../lib/llm/mockProvider';
import { LLMError, type LLMProvider } from '../types/llm';
import { QUESTIONS } from '../data/questions';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';

const validProfile: StyleProfile = {
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

const responsesWith = (text: string): Record<string, AssessmentResponse> => ({
  [QUESTIONS[0].id]: { questionId: QUESTIONS[0].id, text, updatedAt: 1 },
});

describe('toWritingSamples', () => {
  it('drops empty answers and labels the rest', () => {
    const responses = {
      ...responsesWith('a real answer'),
      [QUESTIONS[1].id]: {
        questionId: QUESTIONS[1].id,
        text: '   ',
        updatedAt: 1,
      },
    };
    const samples = toWritingSamples(responses);
    expect(samples).toHaveLength(1);
    expect(samples[0].title).toBe(QUESTIONS[0].title);
  });
});

describe('analyzeStyle', () => {
  it('produces a valid profile through the mock provider', async () => {
    const profile = await analyzeStyle(
      responsesWith('hello'),
      new MockLLMProvider(),
    );
    expect(profile.voice.length).toBeGreaterThan(0);
    expect(profile.directness).toBeGreaterThanOrEqual(0);
    expect(profile.directness).toBeLessThanOrEqual(100);
  });

  it('errors when there is nothing to analyze', async () => {
    await expect(
      analyzeStyle({}, new MockLLMProvider()),
    ).rejects.toBeInstanceOf(AnalysisError);
  });

  it('surfaces a provider error as an AnalysisError', async () => {
    const failing: LLMProvider = {
      id: 'openai',
      complete: () =>
        Promise.reject(new LLMError('Your API key was rejected.')),
    };
    await expect(analyzeStyle(responsesWith('hello'), failing)).rejects.toThrow(
      'Your API key was rejected.',
    );
  });

  it('retries once on malformed output then fails clearly', async () => {
    let calls = 0;
    const garbage: LLMProvider = {
      id: 'mock',
      complete: () => {
        calls++;
        return Promise.resolve('not json at all');
      },
    };
    await expect(
      analyzeStyle(responsesWith('hello'), garbage),
    ).rejects.toBeInstanceOf(AnalysisError);
    expect(calls).toBe(2);
  });

  it('recovers when the retry returns a valid profile', async () => {
    let calls = 0;
    const recovers: LLMProvider = {
      id: 'mock',
      complete: () => {
        calls++;
        return Promise.resolve(
          calls === 1 ? 'not json at all' : JSON.stringify(validProfile),
        );
      },
    };
    const profile = await analyzeStyle(responsesWith('hello'), recovers);
    expect(calls).toBe(2);
    expect(profile.voice).toEqual(validProfile.voice);
    expect(profile.directness).toBe(validProfile.directness);
  });
});
