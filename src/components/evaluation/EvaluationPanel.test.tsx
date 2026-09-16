import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvaluationPanel } from './EvaluationPanel';
import { useEvaluationStore } from '../../store/useEvaluationStore';
import { computeProfileSignature } from '../../lib/signature';
import type { StyleProfile } from '../../types/styleProfile';
import type { EvaluationResult } from '../../types/evaluation';

const profile: StyleProfile = {
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

const result: EvaluationResult = {
  overallScore: 82,
  dimensions: [{ name: 'Tone', score: 80, feedback: 'Close match.' }],
  issues: ['Too many adjectives.'],
  recommendations: ['Trim adjectives.'],
};

const staleNoticeText =
  'This evaluation was run against an earlier profile. Re-run it to score the current one.';

beforeEach(() => {
  localStorage.clear();
  useEvaluationStore.setState({
    sample: null,
    result: null,
    profileSignature: null,
    status: 'idle',
    error: null,
  });
});

describe('EvaluationPanel', () => {
  it('does not show a staleness notice when there is no result yet', () => {
    render(<EvaluationPanel profile={profile} />);
    expect(screen.queryByText(staleNoticeText)).toBeNull();
  });

  it('does not show a staleness notice when the result matches the current profile', () => {
    useEvaluationStore.setState({
      sample: 'A generated sample.',
      result,
      profileSignature: computeProfileSignature(profile),
      status: 'idle',
      error: null,
    });

    render(<EvaluationPanel profile={profile} />);

    expect(screen.queryByText(staleNoticeText)).toBeNull();
  });

  it('shows a staleness notice when the profile changed since the evaluation ran', () => {
    const olderProfile: StyleProfile = { ...profile, directness: 10 };
    useEvaluationStore.setState({
      sample: 'A generated sample.',
      result,
      profileSignature: computeProfileSignature(olderProfile),
      status: 'idle',
      error: null,
    });

    render(<EvaluationPanel profile={profile} />);

    expect(screen.getByText(staleNoticeText)).toBeTruthy();
    // The stale result stays visible; it is not hidden or discarded.
    expect(screen.getByText('A generated sample.')).toBeTruthy();
  });
});
