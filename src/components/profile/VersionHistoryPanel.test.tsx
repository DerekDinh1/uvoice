import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { useAnalysisStore } from '../../store/useAnalysisStore';
import type { StyleProfile } from '../../types/styleProfile';

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

const olderProfile: StyleProfile = { ...sampleProfile, directness: 20 };

beforeEach(() => {
  localStorage.clear();
  useAnalysisStore.setState({
    profile: sampleProfile,
    profileSignature: 'sig',
    versions: [
      { id: 'v2', createdAt: 2000, source: 'edited', profile: sampleProfile },
      { id: 'v1', createdAt: 1000, source: 'analyzed', profile: olderProfile },
    ],
    status: 'ready',
    error: null,
  });
});

describe('VersionHistoryPanel', () => {
  it('shows an empty state when there are no saved versions', () => {
    useAnalysisStore.setState({ versions: [] });

    render(<VersionHistoryPanel />);

    expect(screen.getByText(/No saved versions yet/)).toBeTruthy();
  });

  it('restores an older version to the store and announces the restore', () => {
    render(<VersionHistoryPanel />);

    const restoreButtons = screen.getAllByRole('button', { name: 'Restore' });
    // Versions are listed newest first, so index 1 is the older version.
    fireEvent.click(restoreButtons[1]);

    const state = useAnalysisStore.getState();
    expect(state.profile).toEqual(olderProfile);
    expect(state.versions[0].source).toBe('restored');
    expect(state.versions[0].profile).toEqual(olderProfile);

    expect(screen.getByText(/Restored the version from/)).toBeTruthy();
  });

  it('marks the newly restored version as current in the list', () => {
    render(<VersionHistoryPanel />);

    expect(screen.queryByText('Current')).toBeNull();

    const restoreButtons = screen.getAllByRole('button', { name: 'Restore' });
    fireEvent.click(restoreButtons[1]);

    expect(screen.getByText('Current')).toBeTruthy();
  });

  it('drops the current badge once a newer version is pushed ahead of the restored one', () => {
    render(<VersionHistoryPanel />);

    const restoreButtons = screen.getAllByRole('button', { name: 'Restore' });
    fireEvent.click(restoreButtons[1]);
    expect(screen.getByText('Current')).toBeTruthy();

    // Simulates a re-analysis or edit after the restore, which prepends a
    // fresh version and leaves the restored one no longer at the head.
    act(() => {
      useAnalysisStore.getState().updateProfile(sampleProfile);
    });

    expect(screen.queryByText('Current')).toBeNull();
  });
});
