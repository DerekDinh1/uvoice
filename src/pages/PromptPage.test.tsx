import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PromptPage } from './PromptPage';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { computeProfileSignature } from '../lib/signature';
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

function renderPage() {
  return render(
    <MemoryRouter>
      <PromptPage />
    </MemoryRouter>,
  );
}

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  localStorage.clear();
  useAnalysisStore.setState({
    profile: null,
    profileSignature: null,
    status: 'idle',
    error: null,
  });
  useEvaluationStore.setState({
    sample: null,
    result: null,
    profileSignature: null,
    status: 'idle',
    error: null,
  });
});

afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
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

  it('shows an alert instead of failing silently when the clipboard write rejects', async () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Copy system prompt' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Could not copy');
    });
    expect(
      screen.getByRole('button', { name: 'Copy system prompt' }).textContent,
    ).toBe('Copy');
  });

  it('shows an alert instead of failing silently when there is no Clipboard API', async () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    Object.assign(navigator, { clipboard: undefined });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Copy system prompt' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Could not copy');
    });
  });

  it('shows the evaluate control when a profile exists', () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole('button', { name: 'Generate a sample and score it' }),
    ).toBeTruthy();
  });

  it('renders a persisted evaluation even though status resets to idle on reload', () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    // Simulates a reload: sample and result survived persistence, but status
    // (never persisted) is back to its default.
    useEvaluationStore.setState({
      sample: 'A generated sample.',
      result: sampleResult,
      profileSignature: computeProfileSignature(sampleProfile),
      status: 'idle',
      error: null,
    });

    renderPage();

    expect(screen.getByText('A generated sample.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Overall match' })).toBeTruthy();
    expect(screen.getByText('Tone')).toBeTruthy();
  });

  it('downloads the generated system prompt', () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();

    renderPage();
    fireEvent.click(
      screen.getByRole('button', { name: 'Download system prompt' }),
    );

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Download system prompt' })
        .textContent,
    ).toBe('Downloaded');
  });

  it('shows an alert instead of failing silently when the download fails', () => {
    useAnalysisStore.setState({
      profile: sampleProfile,
      profileSignature: 'sig',
      status: 'ready',
      error: null,
    });
    URL.createObjectURL = vi.fn(() => {
      throw new Error('boom');
    });

    renderPage();
    fireEvent.click(
      screen.getByRole('button', { name: 'Download system prompt' }),
    );

    expect(screen.getByRole('alert').textContent).toContain(
      'Could not download',
    );
  });
});
