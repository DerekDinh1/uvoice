import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpeechRecorder } from './SpeechRecorder';

// Mock the microphone so the recorder can run in jsdom. Transcription uses the
// default mock provider, so no model downloads.
type DataHandler = (event: { data: Blob }) => void;

class MockMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: DataHandler | null = null;
  onstop: (() => void) | null = null;
  constructor(_stream: MediaStream) {}
  start() {
    this.state = 'recording';
  }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const fakeStream = {
  getTracks: () => [{ stop: () => {} }],
} as unknown as MediaStream;

function setMediaDevices(value: unknown) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value,
  });
}

beforeEach(() => {
  window.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(fakeStream) });
});

describe('SpeechRecorder', () => {
  it('records, transcribes with the mock, and returns the transcript', async () => {
    const onTranscript = vi.fn();
    render(<SpeechRecorder onTranscript={onTranscript} />);

    fireEvent.click(
      screen.getByRole('button', { name: /record a spoken answer/i }),
    );
    const stopButton = await screen.findByRole('button', {
      name: /stop recording/i,
    });
    fireEvent.click(stopButton);

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
