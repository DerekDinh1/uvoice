import type { LLMProvider, LLMRequest } from '../../types/llm';
import type { StyleProfile } from '../../types/styleProfile';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Realistic sample analysis so the whole pipeline works with no API key. A few
// numbers are nudged by the length of the samples so different assessments do
// not all look identical, while staying deterministic and schema-valid.
export class MockLLMProvider implements LLMProvider {
  readonly id = 'mock';

  async complete(request: LLMRequest): Promise<string> {
    await delay(250);

    const chars = request.user.length;
    const verbosity = Math.max(20, Math.min(90, Math.round(chars / 40)));

    const profile: StyleProfile = {
      voice: ['Direct', 'Conversational', 'Analytical'],
      tone: ['Warm', 'Confident', 'Pragmatic'],
      directness: 78,
      formality: 42,
      technicalDepth: 70,
      verbosity,
      humor: 35,
      empathy: 60,
      hedging: 28,
      sentenceStyle: {
        typicalLength: 'Short to medium',
        complexity: 'Mostly simple clauses with occasional compound sentences',
        rhythm: 'Varied, with short sentences used for emphasis',
      },
      vocabulary: {
        complexity: 'Everyday words, precise when it matters',
        jargon: 'Uses domain terms sparingly and explains them',
        preferences: ['plain verbs', 'concrete nouns', 'few adverbs'],
      },
      structure: {
        preferredFormat: ['short paragraphs', 'occasional bullet lists'],
        paragraphStyle: 'Lead with the point, then support it',
        bulletUsage: 'For steps and comparisons, not for prose',
      },
      explanationStyle: {
        approach: ['start from the goal', 'use a concrete example'],
        examples: true,
        analogies: true,
        reasoning: true,
      },
      tendencies: [
        'Opens with the conclusion',
        'Prefers examples over abstractions',
        'Trims filler and hedging',
      ],
      avoid: [
        'Long preambles',
        'Corporate buzzwords',
        'Unnecessary qualifiers',
      ],
    };

    return JSON.stringify(profile);
  }
}
