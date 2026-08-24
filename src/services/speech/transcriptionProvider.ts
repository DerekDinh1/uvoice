import type { TranscriptionProvider } from '../../types/speech';
import type { WhisperModelId } from '../../config';
import { MockSpeechProvider } from './mockSpeechProvider';

export type SpeechProviderMode = 'mock' | 'whisper';

// Selects a transcription provider. The Whisper provider (and, transitively, the
// heavy Transformers.js library) is dynamically imported only when whisper mode
// is chosen, so the mock path pulls in none of it.
export async function createTranscriptionProvider(
  mode: SpeechProviderMode,
  model?: WhisperModelId,
): Promise<TranscriptionProvider> {
  if (mode === 'whisper') {
    const { WhisperProvider } = await import('./whisperProvider');
    return new WhisperProvider(model);
  }
  return new MockSpeechProvider();
}
