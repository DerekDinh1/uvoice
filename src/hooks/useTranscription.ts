import { useRef, useState } from 'react';
import { createTranscriptionProvider } from '../services/speech/transcriptionProvider';
import { useSettingsStore } from '../store/useSettingsStore';
import { toSpeechError } from '../types/speech';
import type {
  SpeechError,
  TranscriptionProgress,
  TranscriptionProvider,
} from '../types/speech';

export interface UseTranscription {
  isTranscribing: boolean;
  progress: TranscriptionProgress | null;
  error: SpeechError | null;
  /** Returns the transcript, or null when it failed (see `error`). */
  transcribe: (audio: Blob) => Promise<string | null>;
  setError: (error: SpeechError | null) => void;
}

// Owns provider selection, lazy loading, and transcription state, keeping that
// machinery out of the components that render it.
export function useTranscription(): UseTranscription {
  const speechMode = useSettingsStore((state) => state.speechMode);
  const whisperModel = useSettingsStore((state) => state.whisperModel);

  // Cached per mode+model so changing either rebuilds the provider, and the
  // heavy on-device runtime is only fetched once the user actually records.
  const cacheRef = useRef<{
    key: string;
    provider: Promise<TranscriptionProvider>;
  } | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [error, setError] = useState<SpeechError | null>(null);

  const getProvider = (): Promise<TranscriptionProvider> => {
    const key = `${speechMode}:${whisperModel}`;
    if (cacheRef.current?.key !== key) {
      cacheRef.current = {
        key,
        provider: createTranscriptionProvider(speechMode, whisperModel),
      };
    }
    return cacheRef.current.provider;
  };

  const transcribe = async (audio: Blob): Promise<string | null> => {
    setIsTranscribing(true);
    setProgress({ stage: 'loading-model' });
    try {
      const provider = await getProvider();
      const text = await provider.transcribe(audio, setProgress);
      if (text) return text;

      setError({
        kind: 'transcription-failed',
        message: 'Nothing was transcribed. Try again or type your answer.',
      });
      return null;
    } catch (caught) {
      setError(
        toSpeechError(
          caught,
          'Transcription failed. You can type your answer instead.',
        ),
      );
      return null;
    } finally {
      setIsTranscribing(false);
      setProgress(null);
    }
  };

  return { isTranscribing, progress, error, transcribe, setError };
}
