import { describe, it, expect } from 'vitest';
import { MockSpeechProvider } from './mockSpeechProvider';
import { createTranscriptionProvider } from './transcriptionProvider';

describe('speech providers', () => {
  it('mock provider is supported and returns a non-empty transcript', async () => {
    const provider = new MockSpeechProvider();
    expect(provider.isSupported()).toBe(true);
    await provider.initialize();
    const text = await provider.transcribe(new Blob(['audio']));
    expect(text.trim().length).toBeGreaterThan(0);
  });

  it('factory returns the mock provider for mock mode', async () => {
    const provider = createTranscriptionProvider('mock');
    expect(provider.id).toBe('mock');
    const text = await provider.transcribe(new Blob(['audio']));
    expect(text.trim().length).toBeGreaterThan(0);
  });

  it('factory returns a whisper provider for whisper mode', () => {
    const provider = createTranscriptionProvider('whisper');
    expect(provider.id).toBe('whisper');
  });
});
