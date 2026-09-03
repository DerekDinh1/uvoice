import { beforeEach, describe, it, expect } from 'vitest';
import { useAnalysisStore } from './useAnalysisStore';
import { useSettingsStore } from './useSettingsStore';
import { QUESTIONS } from '../data/questions';
import type { AssessmentResponse } from '../types/assessment';

const responses: Record<string, AssessmentResponse> = {
  [QUESTIONS[0].id]: { questionId: QUESTIONS[0].id, text: 'a sample answer', updatedAt: 1 },
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
});
