import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the heavy library and the Web Audio decode so nothing downloads or touches
// browser audio APIs. This tests the provider's orchestration, not real inference.
const mockTranscriber = vi.fn().mockResolvedValue({ text: '  hello world  ' });
const pipeline = vi.fn().mockResolvedValue(mockTranscriber);

vi.mock('@huggingface/transformers', () => ({
  pipeline,
  env: {},
}));
vi.mock('../../lib/audioDecode', () => ({
  decodeToMono: vi.fn().mockResolvedValue(new Float32Array([0, 0, 0])),
}));

import { WhisperProvider } from './whisperProvider';
import { WHISPER_MODELS } from '../../config';

beforeEach(() => {
  pipeline.mockClear();
  mockTranscriber.mockClear();
});

describe('WhisperProvider', () => {
  it('loads the pipeline for the selected model and returns trimmed text', async () => {
    const provider = new WhisperProvider('base.en');
    const text = await provider.transcribe(new Blob(['audio']));

    expect(pipeline).toHaveBeenCalledWith(
      'automatic-speech-recognition',
      WHISPER_MODELS['base.en'].repo,
      expect.anything(),
    );
    expect(text).toBe('hello world');
  });

  it('initializes the pipeline only once across calls', async () => {
    const provider = new WhisperProvider('tiny.en');
    await provider.transcribe(new Blob(['a']));
    await provider.transcribe(new Blob(['b']));
    expect(pipeline).toHaveBeenCalledTimes(1);
  });

  it('is unsupported without the Web Audio API', () => {
    expect(new WhisperProvider().isSupported()).toBe(false);
  });

  it('is supported when the Web Audio API exists', () => {
    const holder = window as unknown as { AudioContext?: unknown };
    const original = holder.AudioContext;
    holder.AudioContext = class {};
    expect(new WhisperProvider().isSupported()).toBe(true);
    holder.AudioContext = original;
  });
});
