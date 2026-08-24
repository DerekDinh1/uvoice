import type { TranscriptionProvider } from '../../types/speech';
import { MockSpeechProvider } from './mockSpeechProvider';

export type SpeechProviderMode = 'mock' | 'whisper';

// Selects a transcription provider. Only the mock exists in this step; the
// Whisper provider is added in Step 2 and will be lazy-loaded and returned here
// based on the mode.
export function createTranscriptionProvider(
  _mode: SpeechProviderMode,
): TranscriptionProvider {
  return new MockSpeechProvider();
}
