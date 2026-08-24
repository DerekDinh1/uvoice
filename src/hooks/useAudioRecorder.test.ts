import { beforeEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from './useAudioRecorder';

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

describe('useAudioRecorder', () => {
  it('records and returns an audio blob', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('recording');

    let blob: Blob | null = null;
    await act(async () => {
      blob = await result.current.stop();
    });
    expect(result.current.state).toBe('idle');
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as unknown as Blob).size).toBeGreaterThan(0);
  });

  it('reports a permission-denied error when the mic is blocked', async () => {
    setMediaDevices({
      getUserMedia: vi
        .fn()
        .mockRejectedValue(new DOMException('no', 'NotAllowedError')),
    });
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('error');
    expect(result.current.error?.kind).toBe('permission-denied');
  });

  it('reports unsupported when the browser lacks the APIs', async () => {
    setMediaDevices(undefined);
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('error');
    expect(result.current.error?.kind).toBe('unsupported');
  });
});
