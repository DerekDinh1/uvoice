import { describe, it, expect } from 'vitest';
import { styleProfileSchema } from './styleProfile';

const valid = {
  voice: ['Direct'],
  tone: ['Warm'],
  directness: 80,
  formality: 40,
  technicalDepth: 70,
  verbosity: 55,
  humor: 30,
  empathy: 60,
  hedging: 25,
  sentenceStyle: { typicalLength: 'short', complexity: 'simple', rhythm: 'varied' },
  vocabulary: { complexity: 'plain', jargon: 'rare', preferences: ['verbs'] },
  structure: {
    preferredFormat: ['paragraphs'],
    paragraphStyle: 'point first',
    bulletUsage: 'for steps',
  },
  explanationStyle: {
    approach: ['example first'],
    examples: true,
    analogies: false,
    reasoning: true,
  },
  tendencies: ['leads with the point'],
  avoid: ['filler'],
};

describe('styleProfileSchema', () => {
  it('accepts a well-formed profile', () => {
    expect(styleProfileSchema.parse(valid).directness).toBe(80);
  });

  it('clamps out-of-range scores and coerces string numbers', () => {
    const parsed = styleProfileSchema.parse({
      ...valid,
      directness: 150,
      formality: -20,
      humor: '45',
    });
    expect(parsed.directness).toBe(100);
    expect(parsed.formality).toBe(0);
    expect(parsed.humor).toBe(45);
  });

  it('rejects a profile missing required fields', () => {
    const { voice, ...withoutVoice } = valid;
    void voice;
    expect(() => styleProfileSchema.parse(withoutVoice)).toThrow();
  });
});
