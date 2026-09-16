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
  useAnalysisStore.setState({
    profile: null,
    profileSignature: null,
    versions: [],
    status: 'idle',
    error: null,
  });
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

  describe('version history', () => {
    it('pushes an "analyzed" version when analyze succeeds', async () => {
      await useAnalysisStore.getState().analyze(responses);

      const state = useAnalysisStore.getState();
      expect(state.versions).toHaveLength(1);
      expect(state.versions[0].source).toBe('analyzed');
      expect(state.versions[0].profile).toEqual(state.profile);
    });

    it('pushes an "edited" version when updateProfile is called', () => {
      useAnalysisStore.setState({
        profile: sampleProfile,
        profileSignature: 'sig',
        versions: [],
      });

      const edited: StyleProfile = { ...sampleProfile, formality: 90 };
      useAnalysisStore.getState().updateProfile(edited);

      const state = useAnalysisStore.getState();
      expect(state.versions).toHaveLength(1);
      expect(state.versions[0].source).toBe('edited');
      expect(state.versions[0].profile).toEqual(edited);
    });

    it('caps the version list at 10, newest first, dropping the oldest', () => {
      useAnalysisStore.setState({ profile: sampleProfile, versions: [] });

      for (let i = 0; i < 11; i += 1) {
        useAnalysisStore
          .getState()
          .updateProfile({ ...sampleProfile, directness: i });
      }

      const state = useAnalysisStore.getState();
      expect(state.versions).toHaveLength(10);
      // The most recent update is at the front; the very first update (0) was
      // pushed out once the cap was exceeded.
      expect(state.versions[0].profile.directness).toBe(10);
      expect(
        state.versions.some((version) => version.profile.directness === 0),
      ).toBe(false);
      expect(state.versions[state.versions.length - 1].profile.directness).toBe(
        1,
      );
    });

    it('restoreVersion sets the profile and adds a "restored" version without touching profileSignature', () => {
      const older: StyleProfile = { ...sampleProfile, directness: 10 };
      const newer: StyleProfile = { ...sampleProfile, directness: 90 };
      useAnalysisStore.setState({
        profile: newer,
        profileSignature: 'sig',
        versions: [
          { id: 'v2', createdAt: 2, source: 'edited', profile: newer },
          { id: 'v1', createdAt: 1, source: 'analyzed', profile: older },
        ],
      });

      useAnalysisStore.getState().restoreVersion('v1');

      const state = useAnalysisStore.getState();
      expect(state.profile).toEqual(older);
      expect(state.profileSignature).toBe('sig');
      expect(state.versions).toHaveLength(3);
      expect(state.versions[0].source).toBe('restored');
      expect(state.versions[0].profile).toEqual(older);
    });

    it('does nothing when restoring an unknown id', () => {
      useAnalysisStore.setState({
        profile: sampleProfile,
        profileSignature: 'sig',
        versions: [
          {
            id: 'v1',
            createdAt: 1,
            source: 'analyzed',
            profile: sampleProfile,
          },
        ],
      });

      useAnalysisStore.getState().restoreVersion('missing');

      const state = useAnalysisStore.getState();
      expect(state.profile).toEqual(sampleProfile);
      expect(state.versions).toHaveLength(1);
    });

    it('reset clears the version history', () => {
      useAnalysisStore.setState({
        profile: sampleProfile,
        versions: [
          {
            id: 'v1',
            createdAt: 1,
            source: 'analyzed',
            profile: sampleProfile,
          },
        ],
      });

      useAnalysisStore.getState().reset();

      expect(useAnalysisStore.getState().versions).toEqual([]);
    });
  });
});
