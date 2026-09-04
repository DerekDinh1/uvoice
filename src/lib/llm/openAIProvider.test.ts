import { afterEach, describe, it, expect, vi } from 'vitest';
import { OpenAILLMProvider } from './openAIProvider';
import { LLMError } from '../../types/llm';

const request = { system: 's', user: 'u' };
const provider = () =>
  new OpenAILLMProvider({
    apiKey: 'sk-test',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.example.com/v1',
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OpenAILLMProvider', () => {
  it('requires an API key', async () => {
    const noKey = new OpenAILLMProvider({
      apiKey: '',
      model: 'm',
      baseUrl: 'b',
    });
    await expect(noKey.complete(request)).rejects.toBeInstanceOf(LLMError);
  });

  it('returns the message content on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ choices: [{ message: { content: '{"ok":1}' } }] }),
      }),
    );
    await expect(provider().complete(request)).resolves.toBe('{"ok":1}');
  });

  it('maps a 401 to a rejected-key message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );
    await expect(provider().complete(request)).rejects.toThrow(/rejected/i);
  });

  it('wraps a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(provider().complete(request)).rejects.toBeInstanceOf(LLMError);
  });

  it('rejects when the response is ok but content is not a string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: {} }] }),
      }),
    );
    await expect(provider().complete(request)).rejects.toBeInstanceOf(LLMError);
  });
});
