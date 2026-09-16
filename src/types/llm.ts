export const LLM_PROVIDER_MODES = ['mock', 'openai'] as const;
export type LLMProviderMode = (typeof LLM_PROVIDER_MODES)[number];

// A single completion request. The analyzer builds these; providers turn them
// into raw text (expected to be JSON, validated downstream).
export interface LLMRequest {
  system: string;
  user: string;
  // Optional hint about what the request is for. Only the mock provider
  // branches on it, so it can return a plausible response for each stage of
  // the pipeline without a real model; real providers ignore it.
  purpose?: 'analysis' | 'generation' | 'evaluation';
  // What shape the response should take. Analysis and evaluation need
  // structured JSON; generation needs a prose sample. Providers that support
  // forcing a response shape (e.g. OpenAI's JSON mode) should only do so for
  // 'json', since forcing it on a prose task rejects the request. Undefined
  // is treated as 'json' to match the historical default.
  responseFormat?: 'json' | 'text';
}

export interface LLMProvider {
  readonly id: LLMProviderMode;
  complete(request: LLMRequest): Promise<string>;
}

// Thrown for provider-level failures (network, auth, bad response) so callers
// can surface a clear message instead of a raw fetch error.
export class LLMError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}
