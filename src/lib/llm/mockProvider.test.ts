import { describe, it, expect } from 'vitest';
import { MockLLMProvider } from './mockProvider';
import { styleProfileSchema } from '../../types/styleProfile';
import { evaluationResultSchema } from '../../types/evaluation';

describe('MockLLMProvider', () => {
  it('returns a valid style profile when purpose is analysis', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'a writing sample',
      purpose: 'analysis',
    });
    expect(() => styleProfileSchema.parse(JSON.parse(raw))).not.toThrow();
  });

  it('returns a valid style profile when purpose is left unset', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'a writing sample',
    });
    expect(() => styleProfileSchema.parse(JSON.parse(raw))).not.toThrow();
  });

  it('returns a plain-text sample when purpose is generation', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'explain why code review matters',
      purpose: 'generation',
    });
    expect(raw.length).toBeGreaterThan(0);
    expect(() => JSON.parse(raw)).toThrow();
  });

  it('returns a valid evaluation result when purpose is evaluation', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'target profile and sample text',
      purpose: 'evaluation',
    });
    const parsed = evaluationResultSchema.parse(JSON.parse(raw));
    expect(parsed.overallScore).toBeGreaterThanOrEqual(0);
    expect(parsed.overallScore).toBeLessThanOrEqual(100);
    expect(parsed.dimensions.length).toBeGreaterThan(0);
  });

  it('does not give every dimension the same feedback sentence', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'target profile and sample text',
      purpose: 'evaluation',
    });
    const parsed = evaluationResultSchema.parse(JSON.parse(raw));
    const distinctFeedback = new Set(
      parsed.dimensions.map((dimension) => dimension.feedback),
    );
    expect(distinctFeedback.size).toBeGreaterThan(1);
  });

  it('varies feedback with the dimension score, while staying schema-valid', async () => {
    const highScoreRaw = await new MockLLMProvider().complete({
      system: 's',
      user: 'x'.repeat(3000),
      purpose: 'evaluation',
    });
    const lowScoreRaw = await new MockLLMProvider().complete({
      system: 's',
      user: 'short',
      purpose: 'evaluation',
    });
    const highScore = evaluationResultSchema.parse(JSON.parse(highScoreRaw));
    const lowScore = evaluationResultSchema.parse(JSON.parse(lowScoreRaw));

    expect(highScore.dimensions[0].score).toBeGreaterThan(
      lowScore.dimensions[0].score,
    );
    expect(highScore.dimensions[0].feedback).not.toEqual(
      lowScore.dimensions[0].feedback,
    );
  });

  it('never contains an em dash or en dash in evaluation feedback', async () => {
    const raw = await new MockLLMProvider().complete({
      system: 's',
      user: 'target profile and sample text',
      purpose: 'evaluation',
    });
    const parsed = evaluationResultSchema.parse(JSON.parse(raw));
    for (const dimension of parsed.dimensions) {
      expect(dimension.feedback).not.toMatch(/[—–]/);
    }
  });
});
