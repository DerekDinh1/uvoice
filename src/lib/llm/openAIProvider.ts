import type { LLMProvider, LLMRequest } from '../../types/llm';
import { LLMError } from '../../types/llm';

interface OpenAIProviderOptions {
  apiKey: string;
  model: string;
  baseUrl: string;
}

// Talks to an OpenAI-compatible chat completions endpoint using a key the user
// supplies. Requests JSON output; parsing and validation happen in the analyzer.
export class OpenAILLMProvider implements LLMProvider {
  readonly id = 'openai';

  constructor(private readonly options: OpenAIProviderOptions) {}

  async complete(request: LLMRequest): Promise<string> {
    if (!this.options.apiKey) {
      throw new LLMError('Add your API key in Settings to use live mode.');
    }

    let response: Response;
    try {
      response = await fetch(`${this.options.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });
    } catch (caught) {
      throw new LLMError(
        'Could not reach the API. Check your connection.',
        caught,
      );
    }

    if (!response.ok) {
      const detail =
        response.status === 401
          ? 'Your API key was rejected.'
          : `The API returned an error (${response.status}).`;
      throw new LLMError(detail);
    }

    const data: unknown = await response.json().catch(() => null);
    const content = (
      data as { choices?: { message?: { content?: unknown } }[] } | null
    )?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new LLMError('The API returned an unexpected response.');
    }
    return content;
  }
}
