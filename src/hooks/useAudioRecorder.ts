import { useCallback, useRef, useState } from 'react';
import type { RecordingState, SpeechError } from '../types/speech';

export interface UseAudioRecorder {
  state: RecordingState;
  elapsedMs: number;
  error: SpeechError | null;
  isSupported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  reset: () => void;
}

function detectSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder === 'function'
  );
}

// Wraps getUserMedia + MediaRecorder. Handles permission denial and unsupported
// browsers, tracks elapsed time, and returns the recorded audio as a Blob. No
// transcription engine is involved here.
export function useAudioRecorder(): UseAudioRecorder {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<SpeechError | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const isSupported = detectSupport();

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (!isSupported) {
      setError({
        kind: 'unsupported',
        message: 'Recording is not supported in this browser.',
      });
      setState('error');
      return;
    }

    setState('requesting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caught) {
      const denied =
        caught instanceof DOMException &&
        (caught.name === 'NotAllowedError' || caught.name === 'SecurityError');
      setError(
        denied
          ? {
              kind: 'permission-denied',
              message: 'Microphone permission was denied.',
            }
          : { kind: 'unsupported', message: 'Could not access the microphone.' },
      );
      setState('error');
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    // Let the browser choose the mime type so Safari (audio/mp4) works too.
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start();

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setState('recording');
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 200);
  }, [isSupported]);

  const stop = useCallback((): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    clearTimer();

    if (!recorder || recorder.state === 'inactive') {
      stopStream();
      setState('idle');
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        stopStream();
        recorderRef.current = null;
        setState('idle');
        resolve(blob.size > 0 ? blob : null);
      };
      recorder.stop();
    });
  }, [clearTimer, stopStream]);

  const reset = useCallback(() => {
    clearTimer();
    stopStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setElapsedMs(0);
    setError(null);
    setState('idle');
  }, [clearTimer, stopStream]);

  return { state, elapsedMs, error, isSupported, start, stop, reset };
}
