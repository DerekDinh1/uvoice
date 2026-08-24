import type { TranscriptionProvider } from '../../types/speech';
import type { WhisperModelId } from '../../config';
import { MockSpeechProvider } from './mockSpeechProvider';
import { WhisperProvider } from './whisperProvider';

export type SpeechProviderMode = 'mock' | 'whisper';

// Selects a transcription provider. The Whisper provider is constructed cheaply
// here; the heavy library and model load lazily on first use inside initialize.
export function createTranscriptionProvider(
  mode: SpeechProviderMode,
  model?: WhisperModelId,
): TranscriptionProvider {
  if (mode === 'whisper') {
    return new WhisperProvider(model);
  }
  return new MockSpeechProvider();
}
