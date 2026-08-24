import type { TranscriptionProgress } from '../../types/speech';

interface SpeechStatusProps {
  isRecording: boolean;
  elapsedMs: number;
  isTranscribing: boolean;
  progress: TranscriptionProgress | null;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Live status line for the recorder: elapsed time while recording, and model
// load / transcription progress afterward. Announced to screen readers.
export function SpeechStatus({
  isRecording,
  elapsedMs,
  isTranscribing,
  progress,
}: SpeechStatusProps) {
  let label = '';
  if (isRecording) {
    label = `Recording ${formatElapsed(elapsedMs)}`;
  } else if (isTranscribing) {
    if (progress?.stage === 'loading-model') {
      const percent =
        progress.ratio != null ? ` ${Math.round(progress.ratio * 100)}%` : '';
      label = `Loading model${percent}`;
    } else {
      label = 'Transcribing...';
    }
  }

  if (!label) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 text-xs text-muted"
    >
      {isRecording && (
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-danger"
        />
      )}
      {label}
    </span>
  );
}
