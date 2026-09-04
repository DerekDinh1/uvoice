import { describe, it, expect } from 'vitest';
import {
  generateSystemPrompt,
  generateStyleProfileDoc,
} from './promptGenerator';
import type { StyleProfile } from '../types/styleProfile';

const baseProfile: StyleProfile = {
  voice: ['Direct', 'Confident'],
  tone: ['Warm', 'Practical'],
  directness: 55,
  formality: 40,
  technicalDepth: 70,
  verbosity: 45,
  humor: 30,
  empathy: 60,
  hedging: 50,
  sentenceStyle: {
    typicalLength: 'short to medium',
    complexity: 'simple',
    rhythm: 'varied',
  },
  vocabulary: {
    complexity: 'plain',
    jargon: 'rare',
    preferences: ['ship', 'build'],
  },
  structure: {
    preferredFormat: ['short paragraphs', 'bullet lists'],
    paragraphStyle: 'point first',
    bulletUsage: 'for steps',
  },
  explanationStyle: {
    approach: ['example first', 'then the rule'],
    examples: true,
    analogies: false,
    reasoning: true,
  },
  tendencies: ['leads with the point', 'checks in with a question'],
  avoid: ['filler phrases', 'excessive qualifiers'],
};

function withScores(overrides: Partial<StyleProfile>): StyleProfile {
  return { ...baseProfile, ...overrides };
}

const REQUIRED_HEADERS = [
  '# Writing Style Instructions',
  '## Voice',
  '## Tone',
  '## Sentence Structure',
  '## Vocabulary',
  '## Structure',
  '## Explanation Style',
  '## Communication Behavior',
  '## What to Avoid',
  '## Response Guidelines',
];

describe('generateSystemPrompt', () => {
  it('contains every required section header, in order', () => {
    const text = generateSystemPrompt(baseProfile);

    let lastIndex = -1;
    for (const header of REQUIRED_HEADERS) {
      const index = text.indexOf(header);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it('gives a lead-with-the-point instruction for high directness', () => {
    const text = generateSystemPrompt(withScores({ directness: 90 }));
    expect(text.toLowerCase()).toContain('lead with your main point');
  });

  it('gives a different, gradual instruction for low directness', () => {
    const highText = generateSystemPrompt(withScores({ directness: 90 }));
    const lowText = generateSystemPrompt(withScores({ directness: 10 }));
    expect(lowText.toLowerCase()).toContain('ease into points gradually');
    expect(lowText).not.toContain('Lead with your main point');
    expect(highText).not.toEqual(lowText);
  });

  it('gives a confidence instruction for low hedging', () => {
    const text = generateSystemPrompt(withScores({ hedging: 10 }));
    expect(text.toLowerCase()).toContain('do not hedge');
  });

  it('gives an uncertainty-flagging instruction for high hedging', () => {
    const text = generateSystemPrompt(withScores({ hedging: 90 }));
    expect(text.toLowerCase()).toContain('flag uncertainty explicitly');
  });

  it('never contains an em dash or en dash', () => {
    const text = generateSystemPrompt(baseProfile);
    expect(text).not.toMatch(/[—–]/);
  });

  it('omits the Examples section when there is nothing to derive it from', () => {
    const text = generateSystemPrompt(
      withScores({ tendencies: [], avoid: [] }),
    );
    expect(text).not.toContain('## Examples');
  });
});

describe('generateStyleProfileDoc', () => {
  it('includes the numeric scores', () => {
    const text = generateStyleProfileDoc(baseProfile);
    expect(text).toContain('Directness: 55/100');
    expect(text).toContain('Hedging: 50/100');
  });

  it('includes voice and tone', () => {
    const text = generateStyleProfileDoc(baseProfile);
    expect(text).toContain('Direct, Confident');
    expect(text).toContain('Warm, Practical');
  });

  it('never contains an em dash or en dash', () => {
    const text = generateStyleProfileDoc(baseProfile);
    expect(text).not.toMatch(/[—–]/);
  });
});
