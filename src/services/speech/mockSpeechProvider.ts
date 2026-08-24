import type {
  TranscriptionProvider,
  TranscriptionProgress,
} from '../../types/speech';

const SAMPLE_TRANSCRIPT =
  'This is a sample transcript from the mock speech provider. It lets the ' +
  'whole record, transcribe, and edit flow work without downloading a model, ' +
  'and it is what the automated tests run against.';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Stand-in transcription provider. Always supported, no download, deterministic.
export class MockSpeechProvider implements TranscriptionProvider {
  readonly id = 'mock';

  isSupported(): boolean {
    return true;
  }

  async initialize(
    onProgress?: (progress: TranscriptionProgress) => void,
  ): Promise<void> {
    onProgress?.({ stage: 'loading-model', ratio: 1 });
  }

  async transcribe(
    _audio: Blob,
    onProgress?: (progress: TranscriptionProgress) => void,
  ): Promise<string> {
    onProgress?.({ stage: 'transcribing', ratio: 0 });
    await delay(150);
    onProgress?.({ stage: 'transcribing', ratio: 1 });
    return SAMPLE_TRANSCRIPT;
  }
}
