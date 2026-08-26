import { vi } from 'vitest';

// jsdom has neither MediaRecorder nor mediaDevices. These helpers install a
// minimal fake so recording paths can be exercised in tests, and are shared by
// every spec that touches the microphone.

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
    this.ondataavailable?.({
      data: new Blob(['audio'], { type: 'audio/webm' }),
    });
    this.onstop?.();
  }
}

const fakeStream = {
  getTracks: () => [{ stop: () => {} }],
} as unknown as MediaStream;

/** Replaces navigator.mediaDevices; pass undefined to simulate an old browser. */
export function setMediaDevices(value: unknown): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value,
  });
}

/** Installs a working microphone: MediaRecorder plus a granted getUserMedia. */
export function installWorkingMicrophone(): void {
  window.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(fakeStream) });
}

/** Simulates the user (or browser policy) refusing microphone access. */
export function denyMicrophonePermission(): void {
  setMediaDevices({
    getUserMedia: vi
      .fn()
      .mockRejectedValue(new DOMException('denied', 'NotAllowedError')),
  });
}
