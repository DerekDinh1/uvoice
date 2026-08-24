import { useRef, useState } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { MockSpeechProvider } from '../../services/speech/mockSpeechProvider';
import { SpeechErrorException } from '../../types/speech';
import type {
  SpeechError,
  TranscriptionProgress,
  TranscriptionProvider,
} from '../../types/speech';
import { SpeechStatus } from './SpeechStatus';

interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
}

const buttonBase =
  'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

// Optional voice input. Records with the microphone, transcribes through a
// provider, and hands the text back to the parent. Typing is always available,
// so this never blocks the assessment.
//
// Step 3 uses the mock provider only, which keeps the build free of the heavy
// Whisper runtime. Step 4 swaps this for createTranscriptionProvider(mode, model)
// once real on-device mode is selectable and its assets are configured for
// GitHub Pages.
export function SpeechRecorder({ onTranscript }: SpeechRecorderProps) {
  const recorder = useAudioRecorder();

  const providerRef = useRef<TranscriptionProvider | null>(null);
  const getProvider = (): TranscriptionProvider => {
    if (!providerRef.current) {
      providerRef.current = new MockSpeechProvider();
    }
    return providerRef.current;
  };

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [transcribeError, setTranscribeError] = useState<SpeechError | null>(
    null,
  );

  if (!recorder.isSupported) {
    return (
      <p className="text-xs text-muted">
        Voice input is not available in this browser. You can type your answer.
      </p>
    );
  }

  const isRecording = recorder.state === 'recording';
  const isRequesting = recorder.state === 'requesting';
  const error = transcribeError ?? recorder.error;

  const handleStart = async () => {
    setTranscribeError(null);
    await recorder.start();
  };

  const handleStop = async () => {
    const blob = await recorder.stop();
    if (!blob) {
      setTranscribeError({
        kind: 'no-audio',
        message: 'No audio was captured. Try again.',
      });
      return;
    }

    setIsTranscribing(true);
    setProgress({ stage: 'loading-model' });
    try {
      const text = await getProvider().transcribe(blob, setProgress);
      if (text) {
        onTranscript(text);
      } else {
        setTranscribeError({
          kind: 'transcription-failed',
          message: 'Nothing was transcribed. Try again or type your answer.',
        });
      }
    } catch (caught) {
      setTranscribeError(
        caught instanceof SpeechErrorException
          ? { kind: caught.kind, message: caught.message }
          : {
              kind: 'transcription-failed',
              message:
                'Transcription failed. You can type your answer instead.',
            },
      );
    } finally {
      setIsTranscribing(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {isRecording ? (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop recording and transcribe"
            className={`${buttonBase} bg-danger text-white hover:opacity-90`}
          >
            <span aria-hidden="true">■</span> Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={isTranscribing || isRequesting}
            aria-label="Record a spoken answer"
            className={`${buttonBase} border border-border bg-surface-2 text-text hover:opacity-80`}
          >
            <span aria-hidden="true" className="text-danger">
              ●
            </span>
            {isRequesting
              ? 'Allow mic...'
              : isTranscribing
                ? 'Working...'
                : 'Speak'}
          </button>
        )}

        <SpeechStatus
          isRecording={isRecording}
          elapsedMs={recorder.elapsedMs}
          isTranscribing={isTranscribing}
          progress={progress}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
}
