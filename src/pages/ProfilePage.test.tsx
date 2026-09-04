import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';
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

beforeEach(() => {
  localStorage.clear();
  useAnalysisStore.setState({
    profile: sampleProfile,
    profileSignature: 'sig',
    status: 'ready',
    error: null,
  });
});

describe('ProfilePage', () => {
  it('shows scores and sections in the read view', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByText('Directness')).toBeTruthy();
    expect(screen.getByText('80')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Voice' })).toBeTruthy();
    expect(screen.getByText('Direct')).toBeTruthy();
    expect(screen.getByText('short')).toBeTruthy();
  });

  it('enters edit mode when Edit profile is clicked', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    expect(screen.getByRole('heading', { name: 'Edit profile' })).toBeTruthy();
    expect(screen.getByLabelText('Directness')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  it('saves a changed score and a new tag to the store', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    fireEvent.change(screen.getByLabelText('Directness'), {
      target: { value: '55' },
    });

    const addVoiceInput = screen.getByLabelText('Add to voice');
    fireEvent.change(addVoiceInput, { target: { value: 'Blunt' } });
    fireEvent.keyDown(addVoiceInput, { key: 'Enter' });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const state = useAnalysisStore.getState();
    expect(state.profile?.directness).toBe(55);
    expect(state.profile?.voice).toEqual(['Direct', 'Blunt']);
    // Manual edits do not touch the analyzed-response signature.
    expect(state.profileSignature).toBe('sig');
    // Back on the read view.
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  });

  it('discards changes on Cancel', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    fireEvent.change(screen.getByLabelText('Directness'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(useAnalysisStore.getState().profile?.directness).toBe(80);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByText('80')).toBeTruthy();
  });
});
