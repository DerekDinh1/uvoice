import { beforeEach, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from './useAudioRecorder';
import {
  installWorkingMicrophone,
  denyMicrophonePermission,
  setMediaDevices,
} from '../test/mediaRecorderMock';

beforeEach(() => {
  installWorkingMicrophone();
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
    denyMicrophonePermission();
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
