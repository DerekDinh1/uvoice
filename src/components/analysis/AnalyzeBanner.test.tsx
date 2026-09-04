import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnalyzeBanner } from './AnalyzeBanner';
import {
  useAnalysisStore,
  computeResponsesSignature,
} from '../../store/useAnalysisStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { QUESTIONS } from '../../data/questions';
import type { AssessmentResponse } from '../../types/assessment';
import type { StyleProfile } from '../../types/styleProfile';

const responses: Record<string, AssessmentResponse> = {
  [QUESTIONS[0].id]: {
    questionId: QUESTIONS[0].id,
    text: 'hello there',
    updatedAt: 1,
  },
};

const fakeProfile: StyleProfile = {
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

const renderBanner = (
  bannerResponses: Record<string, AssessmentResponse> = responses,
) =>
  render(
    <MemoryRouter>
      <AnalyzeBanner responses={bannerResponses} />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  useAnalysisStore.getState().reset();
  useSettingsStore.setState({ analysisMode: 'mock' });
});

describe('AnalyzeBanner', () => {
  it('disables the button and shows "Analyzing..." while analysis runs', () => {
    useAnalysisStore.setState({ status: 'analyzing' });
    renderBanner();

    const button = screen.getByRole('button', {
      name: 'Analyzing...',
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows the error as an alert when analysis fails', () => {
    useAnalysisStore.setState({
      status: 'error',
      error: 'The analysis request failed.',
    });
    renderBanner();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The analysis request failed.',
    );
  });

  it('shows the "view it" affordance once a profile is ready', async () => {
    renderBanner();
    fireEvent.click(
      screen.getByRole('button', { name: 'Analyze my writing style' }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: /your profile is ready/i }),
      ).toBeTruthy(),
    );
  });

  it('shows the "view it" affordance for a profile that survived a reload', () => {
    // Simulates a reload: status resets to 'idle' but the persisted profile
    // and its signature remain.
    useAnalysisStore.setState({
      profile: fakeProfile,
      profileSignature: computeResponsesSignature(responses),
      status: 'idle',
    });
    renderBanner();

    expect(
      screen.getByRole('link', { name: /your profile is ready/i }),
    ).toBeTruthy();
  });

  it('flags the profile as out of date once responses change', () => {
    useAnalysisStore.setState({
      profile: fakeProfile,
      profileSignature: computeResponsesSignature(responses),
      status: 'idle',
    });
    const changedResponses: Record<string, AssessmentResponse> = {
      [QUESTIONS[0].id]: {
        questionId: QUESTIONS[0].id,
        text: 'a very different, much longer answer than the original one',
        updatedAt: 2,
      },
    };
    renderBanner(changedResponses);

    expect(screen.getByRole('link', { name: /out of date/i })).toBeTruthy();
    expect(screen.getByText(/answers changed/i)).toBeTruthy();
  });
});
