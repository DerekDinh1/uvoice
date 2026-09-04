import { beforeEach, describe, it, expect } from 'vitest';
import { useAnalysisStore } from './useAnalysisStore';
import { useSettingsStore } from './useSettingsStore';
import { QUESTIONS } from '../data/questions';
import { STORAGE_KEYS } from '../config';
import type { AssessmentResponse } from '../types/assessment';
import type { StyleProfile } from '../types/styleProfile';

const responses: Record<string, AssessmentResponse> = {
  [QUESTIONS[0].id]: {
    questionId: QUESTIONS[0].id,
    text: 'a sample answer',
    updatedAt: 1,
  },
};

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
  useAnalysisStore.setState({ profile: null, status: 'idle', error: null });
  useSettingsStore.setState({ analysisMode: 'mock', apiKey: '' });
});

describe('useAnalysisStore', () => {
  it('produces a profile in demo mode', async () => {
    await useAnalysisStore.getState().analyze(responses);
    const state = useAnalysisStore.getState();
    expect(state.status).toBe('ready');
    expect(state.profile).not.toBeNull();
  });

  it('reports an error when live mode has no key', async () => {
    useSettingsStore.setState({ analysisMode: 'openai', apiKey: '' });
    await useAnalysisStore.getState().analyze(responses);
    const state = useAnalysisStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBeTruthy();
  });

  describe('updateProfile', () => {
    it('replaces the profile without touching profileSignature', () => {
      useAnalysisStore.setState({
        profile: sampleProfile,
        profileSignature: 'original-signature',
        status: 'ready',
        error: null,
      });

      const edited: StyleProfile = { ...sampleProfile, formality: 90 };
      useAnalysisStore.getState().updateProfile(edited);

      const state = useAnalysisStore.getState();
      expect(state.profile).toEqual(edited);
      expect(state.profileSignature).toBe('original-signature');
    });

    it('persists the updated profile to storage', () => {
      useAnalysisStore.setState({
        profile: sampleProfile,
        profileSignature: 'sig',
        status: 'ready',
        error: null,
      });

      const edited: StyleProfile = { ...sampleProfile, voice: ['Blunt'] };
      useAnalysisStore.getState().updateProfile(edited);

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.analysis) ?? '{}',
      );
      expect(stored.state.profile.voice).toEqual(['Blunt']);
    });
  });
});
