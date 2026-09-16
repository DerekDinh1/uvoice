import type { LLMProvider, LLMRequest } from '../../types/llm';
import type { StyleProfile } from '../../types/styleProfile';
import { STYLE_DIMENSIONS } from '../../types/styleProfile';
import type { EvaluationResult } from '../../types/evaluation';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A short, plain paragraph returned for every generation request. It is not
// tailored to the task text, only realistic and deterministic, so the sample
// and evaluation stages work offline the same way the analysis stage does.
const SAMPLE_TEXT = [
  'Code review matters because a second reader catches mistakes the author',
  'missed, from a typo in a comment to a real bug in the logic. It also',
  'spreads knowledge across the team, so no single person is the only one',
  'who understands a piece of code. A good review stays specific: point out',
  'the exact line, explain why it matters, and suggest a fix instead of a',
  'vague complaint. Skipping this step to save time now usually costs more',
  'time later, once the issue reaches users.',
].join(' ');

// Per-dimension evaluation feedback, grouped by score bucket so a low score
// reads as a problem and a high score reads as a pass, and varied by a few
// phrasings per bucket so the feedback grid does not read as one template
// with the label swapped in. Selection is deterministic: it only depends on
// the dimension's score and its position in STYLE_DIMENSIONS.
type ScoreBucket = 'low' | 'mid' | 'high';

function scoreBucket(score: number): ScoreBucket {
  if (score <= 33) return 'low';
  if (score <= 66) return 'mid';
  return 'high';
}

const FEEDBACK_TEMPLATES: Record<
  ScoreBucket,
  Array<(label: string) => string>
> = {
  high: [
    (label) => `The sample's ${label} matches the target closely.`,
    (label) => `The sample stays right on target for ${label}.`,
    (label) => `The sample handles ${label} the way the profile calls for.`,
  ],
  mid: [
    (label) => `The sample's ${label} is close, with a little room to tighten.`,
    (label) =>
      `The sample is in the right range for ${label}, but not fully dialed in.`,
    (label) =>
      `The sample's ${label} is close to the target and could use a small nudge.`,
  ],
  low: [
    (label) =>
      `The sample's ${label} drifts from the target and needs attention.`,
    (label) => `The sample falls short on ${label} and should be reworked.`,
    (label) =>
      `The sample's ${label} misses the target by a noticeable margin.`,
  ],
};

function feedbackFor(label: string, score: number, index: number): string {
  const templates = FEEDBACK_TEMPLATES[scoreBucket(score)];
  const template = templates[index % templates.length];
  return template(label.toLowerCase());
}

// Realistic sample analysis so the whole pipeline works with no API key. A few
// numbers are nudged by the length of the samples so different assessments do
// not all look identical, while staying deterministic and schema-valid.
export class MockLLMProvider implements LLMProvider {
  readonly id = 'mock';

  async complete(request: LLMRequest): Promise<string> {
    await delay(250);

    if (request.purpose === 'generation') {
      return SAMPLE_TEXT;
    }

    if (request.purpose === 'evaluation') {
      return JSON.stringify(this.buildEvaluation(request.user));
    }

    const profile: StyleProfile = {
      voice: ['Direct', 'Conversational', 'Analytical'],
      tone: ['Warm', 'Confident', 'Pragmatic'],
      directness: 78,
      formality: 42,
      technicalDepth: 70,
      verbosity: this.verbosityFor(request.user),
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

  private verbosityFor(userText: string): number {
    const chars = userText.length;
    return Math.max(20, Math.min(90, Math.round(chars / 40)));
  }

  // Deterministic, schema-valid evaluation. The overall score and per-dimension
  // scores are nudged by the length of the evaluated request so different
  // profiles and samples do not all score identically.
  private buildEvaluation(userText: string): EvaluationResult {
    const chars = userText.length;
    const base = Math.max(55, Math.min(92, Math.round(chars / 25)));

    const dimensions = STYLE_DIMENSIONS.map((dimension, index) => {
      const score = Math.max(0, Math.min(100, base - index * 3));
      return {
        name: dimension.label,
        score,
        feedback: feedbackFor(dimension.label, score, index),
      };
    });

    return {
      overallScore: base,
      dimensions,
      issues: [
        'A couple of sentences run longer than the target verbosity.',
        'One passage hedges more than the profile calls for.',
        'The opening line eases in instead of leading with the point.',
      ],
      recommendations: [
        'Trim the longest sentence into two shorter ones.',
        'Replace soft qualifiers with a direct statement where the profile prefers confidence.',
        'Move the main conclusion to the first sentence of each section.',
      ],
    };
  }
}
