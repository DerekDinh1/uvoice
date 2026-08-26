import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useTranscription } from '../../hooks/useTranscription';
import { useSettingsStore } from '../../store/useSettingsStore';
import { buttonClass } from '../ui/buttonStyles';
import { SpeechStatus } from './SpeechStatus';

interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
}

const control = (variant: 'outline' | 'danger') =>
  `inline-flex items-center gap-2 ${buttonClass(variant, 'px-3 py-1.5')}`;

// Optional voice input. Records with the microphone, hands the audio to the
// transcription hook, and passes the resulting text to the parent. Typing is
// always available, so this never blocks the assessment.
export function SpeechRecorder({ onTranscript }: SpeechRecorderProps) {
  const recorder = useAudioRecorder();
  const transcription = useTranscription();
  const speechMode = useSettingsStore((state) => state.speechMode);

  if (!recorder.isSupported) {
    return (
      <p className="text-xs text-muted">
        Voice input is not available in this browser. You can type your answer.
      </p>
    );
  }

  const isRecording = recorder.state === 'recording';
  const isRequesting = recorder.state === 'requesting';
  const error = transcription.error ?? recorder.error;

  const handleStart = async () => {
    transcription.setError(null);
    await recorder.start();
  };

  const handleStop = async () => {
    const audio = await recorder.stop();
    if (!audio) {
      transcription.setError({
        kind: 'no-audio',
        message: 'No audio was captured. Try again.',
      });
      return;
    }

    const text = await transcription.transcribe(audio);
    if (text) onTranscript(text);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {isRecording ? (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop recording and transcribe"
            className={control('danger')}
          >
            <span aria-hidden="true">■</span> Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={transcription.isTranscribing || isRequesting}
            aria-label="Record a spoken answer"
            className={control('outline')}
          >
            <span aria-hidden="true" className="text-danger">
              ●
            </span>
            {isRequesting
              ? 'Allow mic...'
              : transcription.isTranscribing
                ? 'Working...'
                : 'Speak'}
          </button>
        )}

        <SpeechStatus
          isRecording={isRecording}
          elapsedMs={recorder.elapsedMs}
          isTranscribing={transcription.isTranscribing}
          progress={transcription.progress}
        />
      </div>

      {speechMode === 'mock' && (
        <p className="text-xs text-muted">
          Demo mode returns a sample sentence, not your words. Switch to
          on-device Whisper in Settings to transcribe what you say.
        </p>
      )}

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
}
