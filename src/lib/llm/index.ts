import type { LLMProvider, LLMProviderMode } from '../../types/llm';
import { LLM_CONFIG } from '../../config';
import { MockLLMProvider } from './mockProvider';
import { OpenAILLMProvider } from './openAIProvider';

// Selects an LLM provider. Mock needs nothing; OpenAI uses the user's key with
// the centrally configured model and base URL.
export function createLLMProvider(
  mode: LLMProviderMode,
  options: { apiKey: string },
): LLMProvider {
  if (mode === 'openai') {
    return new OpenAILLMProvider({
      apiKey: options.apiKey,
      model: LLM_CONFIG.model,
      baseUrl: LLM_CONFIG.apiBaseUrl,
    });
  }
  return new MockLLMProvider();
}
