import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { QUESTIONS } from '../data/questions';
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
    versions: [],
    status: 'ready',
    error: null,
  });
  useAppStore.setState({ responses: {}, currentIndex: 0, startedAt: null });
  useSettingsStore.setState({ analysisMode: 'mock', apiKey: '' });
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

  it('moves focus to the editor heading when entering edit mode', () => {
    // ProfileView and ProfileEditor are different trees swapped within the
    // same route, so the route-based focus manager never fires for this
    // transition; the editor has to move focus itself.
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Edit profile' }),
    );
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
    // Focus returns to the button that opened the editor, not <body>.
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Edit profile' }),
    );
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
    // Focus returns to the button that opened the editor, not <body>.
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Edit profile' }),
    );
  });

  describe('re-analyze and history', () => {
    it('disables Re-analyze when there are no answered responses', () => {
      render(<ProfilePage />);

      const button = screen.getByRole('button', {
        name: 'Re-analyze',
      }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('lists a new version in the History panel after a re-analyze', async () => {
      useAppStore.setState({
        responses: {
          [QUESTIONS[0].id]: {
            questionId: QUESTIONS[0].id,
            text: 'a sample answer',
            updatedAt: 1,
          },
        },
      });
      render(<ProfilePage />);

      expect(screen.getByText(/No saved versions yet/)).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: 'Re-analyze' }));

      await waitFor(() => {
        expect(useAnalysisStore.getState().versions).toHaveLength(1);
      });
      expect(useAnalysisStore.getState().versions[0].source).toBe('analyzed');
      expect(screen.getAllByText('Analyzed').length).toBeGreaterThan(0);
    });

    it('restores an older version back to the current profile', () => {
      const older: StyleProfile = { ...sampleProfile, directness: 20 };
      useAnalysisStore.setState({
        versions: [
          {
            id: 'v2',
            createdAt: 2000,
            source: 'edited',
            profile: sampleProfile,
          },
          { id: 'v1', createdAt: 1000, source: 'analyzed', profile: older },
        ],
      });
      render(<ProfilePage />);

      const restoreButtons = screen.getAllByRole('button', {
        name: 'Restore',
      });
      // Versions are listed newest first, so index 1 is the older version.
      fireEvent.click(restoreButtons[1]);

      const state = useAnalysisStore.getState();
      expect(state.profile).toEqual(older);
      expect(state.versions[0].source).toBe('restored');
      expect(state.versions[0].profile).toEqual(older);
    });

    it('shows a diff when comparing two history versions', () => {
      const older: StyleProfile = {
        ...sampleProfile,
        directness: 20,
        voice: ['Careful'],
      };
      useAnalysisStore.setState({
        versions: [
          {
            id: 'v2',
            createdAt: 2000,
            source: 'edited',
            profile: sampleProfile,
          },
          { id: 'v1', createdAt: 1000, source: 'analyzed', profile: older },
        ],
      });
      render(<ProfilePage />);

      // Defaults to comparing the two most recent (only two, here) versions.
      expect(screen.getByText(/20 to 80/)).toBeTruthy();
      expect(screen.getByText('Added: Direct')).toBeTruthy();
      expect(screen.getByText('Removed: Careful')).toBeTruthy();
    });
  });
});
