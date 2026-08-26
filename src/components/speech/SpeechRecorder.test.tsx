import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpeechRecorder } from './SpeechRecorder';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  installWorkingMicrophone,
  setMediaDevices,
} from '../../test/mediaRecorderMock';

beforeEach(() => {
  installWorkingMicrophone();
  // Pin demo mode so the test never reaches for the real model.
  useSettingsStore.setState({ speechMode: 'mock' });
});

describe('SpeechRecorder', () => {
  it('records, transcribes with the mock, and returns the transcript', async () => {
    const onTranscript = vi.fn();
    render(<SpeechRecorder onTranscript={onTranscript} />);

    fireEvent.click(
      screen.getByRole('button', { name: /record a spoken answer/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /stop recording/i }),
    );

    await waitFor(() => expect(onTranscript).toHaveBeenCalledTimes(1));
    expect(onTranscript.mock.calls[0][0].length).toBeGreaterThan(0);
  });

  it('falls back to a typing note when recording is unsupported', () => {
    setMediaDevices(undefined);
    render(<SpeechRecorder onTranscript={vi.fn()} />);

    expect(screen.getByText(/voice input is not available/i)).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /record a spoken answer/i }),
    ).toBeNull();
  });
});
