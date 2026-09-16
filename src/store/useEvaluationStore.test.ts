import { beforeEach, describe, it, expect } from 'vitest';
import { useEvaluationStore } from './useEvaluationStore';
import { useSettingsStore } from './useSettingsStore';
import { computeProfileSignature } from '../lib/signature';
import { STORAGE_KEYS } from '../config';
import type { StyleProfile } from '../types/styleProfile';

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

beforeEach(() => {
  localStorage.clear();
  useEvaluationStore.setState({
    sample: null,
    result: null,
    profileSignature: null,
    status: 'idle',
    error: null,
  });
  useSettingsStore.setState({ analysisMode: 'mock', apiKey: '' });
});

describe('useEvaluationStore', () => {
  it('produces a sample and evaluation in demo mode', async () => {
    await useEvaluationStore.getState().evaluate(sampleProfile);
    const state = useEvaluationStore.getState();
    expect(state.status).toBe('ready');
    expect(state.sample).not.toBeNull();
    expect(state.result).not.toBeNull();
  });

  it('stores a signature of the profile the result was scored against', async () => {
    await useEvaluationStore.getState().evaluate(sampleProfile);
    const state = useEvaluationStore.getState();
    expect(state.profileSignature).toBe(computeProfileSignature(sampleProfile));
  });

  it('persists the sample, result, and profile signature to storage', async () => {
    await useEvaluationStore.getState().evaluate(sampleProfile);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.evaluation) ?? '{}',
    );
    expect(stored.state.sample).toBeTruthy();
    expect(stored.state.result.overallScore).toBeGreaterThanOrEqual(0);
    expect(stored.state.profileSignature).toBe(
      computeProfileSignature(sampleProfile),
    );
  });

  it('reports an error when live mode has no key', async () => {
    useSettingsStore.setState({ analysisMode: 'openai', apiKey: '' });
    await useEvaluationStore.getState().evaluate(sampleProfile);
    const state = useEvaluationStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBeTruthy();
  });

  describe('reset', () => {
    it('clears the sample, result, profile signature, status, and error', async () => {
      await useEvaluationStore.getState().evaluate(sampleProfile);
      useEvaluationStore.getState().reset();

      const state = useEvaluationStore.getState();
      expect(state.sample).toBeNull();
      expect(state.result).toBeNull();
      expect(state.profileSignature).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
    });
  });
});
