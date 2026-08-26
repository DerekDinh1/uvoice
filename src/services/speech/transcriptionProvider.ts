import type { TranscriptionProvider } from '../../types/speech';
import type { SpeechProviderMode, WhisperModelId } from '../../config';

export type { SpeechProviderMode };

// Selects a transcription provider. Each implementation is imported dynamically
// so that choosing the mock never pulls in the heavy Whisper runtime, and the
// runtime only downloads when a user actually opts into on-device mode.
export async function createTranscriptionProvider(
  mode: SpeechProviderMode,
  model?: WhisperModelId,
): Promise<TranscriptionProvider> {
  if (mode === 'whisper') {
    const { WhisperProvider } = await import('./whisperProvider');
    return new WhisperProvider(model);
  }
  const { MockSpeechProvider } = await import('./mockSpeechProvider');
  return new MockSpeechProvider();
}
