import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PromptPage } from './PromptPage';
import { useAnalysisStore } from '../store/useAnalysisStore';
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

function renderPage() {
  return render(
    <MemoryRouter>
      <PromptPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useAnalysisStore.setState({
    profile: null,
    profileSignature: null,
    status: 'idle',
    error: null,
  });
});

describe('PromptPage', () => {
  it('shows an empty state that links to the assessment when there is no profile', () => {
    renderPage();

    expect(screen.getByText(/No profile yet/)).toBeTruthy();
    const link = screen.getByRole('link', { name: /go to the assessment/i });
    expect(link.getAttribute('href')).toContain('/assessment');
  });

  it('renders both generated documents with copy and download controls', () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'System Prompt' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Style Profile' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Copy system prompt' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Copy style profile' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Download system prompt' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Download style profile' }),
    ).toBeTruthy();
  });

  it('copies the generated system prompt to the clipboard', async () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Copy system prompt' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain(
      '# Writing Style Instructions',
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Copy system prompt' }).textContent,
      ).toBe('Copied'),
    );
  });
});
