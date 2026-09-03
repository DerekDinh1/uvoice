export const LLM_PROVIDER_MODES = ['mock', 'openai'] as const;
export type LLMProviderMode = (typeof LLM_PROVIDER_MODES)[number];

// A single completion request. The analyzer builds these; providers turn them
// into raw text (expected to be JSON, validated downstream).
export interface LLMRequest {
  system: string;
  user: string;
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
