// Phase 2.5 speech types. Recording is device I/O (see useAudioRecorder);
// transcription is the pluggable ML step (see TranscriptionProvider). Keeping
// them separate mirrors the LLM provider split.

export type RecordingState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'transcribing'
  | 'error';

export type SpeechErrorKind =
  | 'unsupported'
  | 'permission-denied'
  | 'no-audio'
  | 'model-load-failed'
  | 'transcription-failed';

export interface SpeechError {
  kind: SpeechErrorKind;
  message: string;
}

// Throwable version carrying a kind, so callers can branch on the failure.
export class SpeechErrorException extends Error {
  readonly kind: SpeechErrorKind;
  constructor(kind: SpeechErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = 'SpeechErrorException';
    this.kind = kind;
    if (cause !== undefined) this.cause = cause;
  }
}

// Normalizes anything thrown during transcription into displayable state, so
// callers do not each re-implement the same instanceof check.
export function toSpeechError(caught: unknown, fallback: string): SpeechError {
  if (caught instanceof SpeechErrorException) {
    return { kind: caught.kind, message: caught.message };
  }
  return { kind: 'transcription-failed', message: fallback };
}

export interface TranscriptionProgress {
  stage: 'loading-model' | 'transcribing';
  ratio?: number; // 0..1 when known
}

// A source of transcripts. The mock needs no download; the Whisper provider is
// lazy-loaded and runs locally in the browser.
export interface TranscriptionProvider {
  readonly id: string;
  isSupported(): boolean;
  initialize(onProgress?: (progress: TranscriptionProgress) => void): Promise<void>;
  transcribe(
    audio: Blob,
    onProgress?: (progress: TranscriptionProgress) => void,
  ): Promise<string>;
}
