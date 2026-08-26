import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';
import { useSettingsStore } from '../store/useSettingsStore';
import { SPEECH_CONFIG } from '../config';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({
    speechMode: SPEECH_CONFIG.defaultProviderMode,
    whisperModel: SPEECH_CONFIG.defaultModel,
  });
});

describe('SettingsPage', () => {
  it('hides the model picker in demo mode', () => {
    useSettingsStore.setState({ speechMode: 'mock' });
    render(<SettingsPage />);
    expect(screen.queryByLabelText('Model')).toBeNull();
  });

  it('shows the model picker for on-device Whisper', () => {
    render(<SettingsPage />);
    expect(useSettingsStore.getState().speechMode).toBe('whisper');
    expect(screen.getByLabelText('Model')).toBeTruthy();
  });

  it('switches to demo transcription', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('radio', { name: /demo transcript/i }));
    expect(useSettingsStore.getState().speechMode).toBe('mock');
  });

  it('changes the selected model', () => {
    useSettingsStore.setState({ speechMode: 'whisper' });
    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText('Model'), {
      target: { value: 'tiny.en' },
    });
    expect(useSettingsStore.getState().whisperModel).toBe('tiny.en');
  });

  it('states that audio is not uploaded', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/audio is not\s+uploaded/i)).toBeTruthy();
  });
});
