import { beforeEach, describe, it, expect } from 'vitest';
import { resetSession } from './resetSession';
import { useAppStore } from '../store/useAppStore';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { QUESTIONS } from '../data/questions';
import type { StyleProfile } from '../types/styleProfile';
import type { EvaluationResult } from '../types/evaluation';

const sampleProfile: StyleProfile = {
  voice: ['Direct'],
  tone: ['Warm'],
  directness: 80,
  formality: 40,
  technicalDepth: 70,
  verbosity: 55,
  humor: 30,
  empathy: 60,
  hedging: 25,
  sentenceStyle: {
    typicalLength: 'short',
    complexity: 'simple',
    rhythm: 'varied',
  },
  vocabulary: { complexity: 'plain', jargon: 'rare', preferences: ['verbs'] },
  structure: {
    preferredFormat: ['paragraphs'],
    paragraphStyle: 'point first',
    bulletUsage: 'for steps',
  },
  explanationStyle: {
    approach: ['example first'],
    examples: true,
    analogies: false,
    reasoning: true,
  },
  tendencies: ['leads with the point'],
  avoid: ['filler'],
};

const sampleResult: EvaluationResult = {
  overallScore: 82,
  dimensions: [{ name: 'Tone', score: 80, feedback: 'Close match.' }],
  issues: ['Too many adjectives.'],
  recommendations: ['Trim adjectives.'],
};

beforeEach(() => {
  localStorage.clear();
});

describe('resetSession', () => {
  it('clears the assessment, the profile and its history, and the last evaluation', () => {
    useAppStore.getState().setResponse(QUESTIONS[0].id, 'an answer');
    useAppStore.getState().goTo(2);

    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      versions: [
        { id: 'v1', createdAt: 1, source: 'analyzed', profile: sampleProfile },
      ],
      status: 'ready',
      error: null,
    });

    useEvaluationStore.setState({
      sample: 'A generated sample.',
      result: sampleResult,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });

    resetSession();

    const appState = useAppStore.getState();
    expect(Object.keys(appState.responses)).toHaveLength(0);
    expect(appState.currentIndex).toBe(0);
    expect(appState.startedAt).toBeNull();

    const analysisState = useAnalysisStore.getState();
    expect(analysisState.profile).toBeNull();
    expect(analysisState.profileSignature).toBeNull();
    expect(analysisState.versions).toEqual([]);
    expect(analysisState.status).toBe('idle');

    const evaluationState = useEvaluationStore.getState();
    expect(evaluationState.sample).toBeNull();
    expect(evaluationState.result).toBeNull();
    expect(evaluationState.profileSignature).toBeNull();
    expect(evaluationState.status).toBe('idle');
  });
});
