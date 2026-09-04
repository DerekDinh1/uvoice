import type { StyleProfile } from '../types/styleProfile';
import { STYLE_DIMENSIONS } from '../types/styleProfile';
import type { GeneratedPrompt } from '../types/prompt';

// Deterministic, offline conversion of a StyleProfile into Markdown. No LLM
// call and no network access: every string here is derived from the profile
// object passed in, so the same profile always produces the same output.

type Bucket = 'low' | 'moderate' | 'high';

// 0..33 is treated as low, 34..66 as moderate, 67..100 as high, matching the
// scale documented on styleProfileSchema.
function bucketOf(score: number): Bucket {
  if (score <= 33) return 'low';
  if (score <= 66) return 'moderate';
  return 'high';
}

function pick(score: number, byBucket: Record<Bucket, string>): string {
  return byBucket[bucketOf(score)];
}

function joinOrFallback(items: string[], fallback: string): string {
  return items.length > 0 ? items.join(', ') : fallback;
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

const DIRECTNESS: Record<Bucket, string> = {
  low: 'Ease into points gradually. Give context and lead-up before stating the main idea.',
  moderate:
    'Balance context with the point. A short lead-in is fine, but do not bury the main idea.',
  high: 'Lead with your main point, then support it. Skip preamble.',
};

const FORMALITY: Record<Bucket, string> = {
  low: 'Keep the register casual and conversational. Contractions and informal phrasing are fine.',
  moderate:
    'Keep a neutral, professional register. Avoid both slang and stiff formality.',
  high: 'Keep the register formal and polished. Avoid contractions and casual phrasing.',
};

const TECHNICAL_DEPTH: Record<Bucket, string> = {
  low: 'Avoid jargon. Explain concepts in plain, everyday language.',
  moderate:
    'Use some domain terms, but define anything that is not common knowledge.',
  high: 'Use precise domain terms and assume the reader is fluent in the subject.',
};

const VERBOSITY: Record<Bucket, string> = {
  low: 'Be concise. Use the fewest words that do the job.',
  moderate:
    'Write with a normal amount of detail. Do not pad, but do not clip every sentence either.',
  high: 'Be thorough. Cover context and caveats instead of compressing.',
};

const HUMOR: Record<Bucket, string> = {
  low: 'Keep the tone serious and straightforward. Do not add jokes or playful asides.',
  moderate:
    'A light, occasional joke or playful aside is fine, but keep it rare.',
  high: 'Use humor freely: playful asides and wit are welcome.',
};

const EMPATHY: Record<Bucket, string> = {
  low: 'Stay matter of fact. Do not add emotional framing or reassurance.',
  moderate:
    "Briefly acknowledge the person's situation before moving to the substance.",
  high: 'Lead with acknowledgment and warmth before getting to the substance. Validate feelings explicitly.',
};

const HEDGING: Record<Bucket, string> = {
  low: "State claims plainly and with confidence. Do not hedge with words like 'maybe' or 'I think'.",
  moderate:
    'Qualify a claim when genuinely uncertain, but do not hedge by default.',
  high: "Flag uncertainty explicitly. Use qualifiers such as 'in most cases' where a claim is not absolute.",
};

// The AI-facing system prompt: short, imperative instructions an assistant can
// follow directly. Section order is fixed so every generated prompt has the
// same shape.
export function generateSystemPrompt(profile: StyleProfile): string {
  const sections: string[] = [];

  sections.push('# Writing Style Instructions');

  sections.push(
    [
      '## Voice',
      pick(profile.directness, DIRECTNESS),
      profile.voice.length > 0
        ? `Write in a voice that reads as: ${profile.voice.join(', ')}.`
        : null,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  );

  sections.push(
    [
      '## Tone',
      pick(profile.humor, HUMOR),
      pick(profile.empathy, EMPATHY),
      profile.tone.length > 0
        ? `Keep the tone consistent with: ${profile.tone.join(', ')}.`
        : null,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  );

  sections.push(
    [
      '## Sentence Structure',
      pick(profile.verbosity, VERBOSITY),
      `Keep sentences at a typical length of: ${profile.sentenceStyle.typicalLength}.`,
      `Match a sentence complexity of: ${profile.sentenceStyle.complexity}.`,
      `Give sentences a rhythm of: ${profile.sentenceStyle.rhythm}.`,
    ].join('\n'),
  );

  sections.push(
    [
      '## Vocabulary',
      pick(profile.technicalDepth, TECHNICAL_DEPTH),
      `Use vocabulary that is ${profile.vocabulary.complexity} in complexity.`,
      `Jargon use: ${profile.vocabulary.jargon}.`,
      profile.vocabulary.preferences.length > 0
        ? `Favor these words and phrases where natural: ${profile.vocabulary.preferences.join(', ')}.`
        : null,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  );

  sections.push(
    [
      '## Structure',
      profile.structure.preferredFormat.length > 0
        ? `Prefer these formats: ${profile.structure.preferredFormat.join(', ')}.`
        : null,
      `Paragraph style: ${profile.structure.paragraphStyle}.`,
      `Bullet usage: ${profile.structure.bulletUsage}.`,
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  );

  sections.push(
    [
      '## Explanation Style',
      profile.explanationStyle.approach.length > 0
        ? `When explaining something: ${profile.explanationStyle.approach.join(', ')}.`
        : null,
      profile.explanationStyle.examples
        ? 'Include concrete examples to illustrate points.'
        : 'Do not pad explanations with examples unless asked for one.',
      profile.explanationStyle.analogies
        ? 'Use analogies to make abstract ideas concrete.'
        : 'Avoid analogies; explain ideas directly instead.',
      profile.explanationStyle.reasoning
        ? 'Show your reasoning: walk through the steps that lead to a conclusion.'
        : 'State conclusions directly without walking through the reasoning.',
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  );

  sections.push(
    [
      '## Communication Behavior',
      pick(profile.formality, FORMALITY),
      pick(profile.hedging, HEDGING),
    ].join('\n'),
  );

  sections.push(
    [
      '## What to Avoid',
      profile.avoid.length > 0
        ? bulletList(profile.avoid.map((item) => `Avoid ${item}.`))
        : 'No specific avoidances were flagged. Use ordinary good judgment.',
    ].join('\n'),
  );

  sections.push(
    [
      '## Response Guidelines',
      profile.tendencies.length > 0
        ? [
            'Reflect these habits in every response:',
            bulletList(profile.tendencies),
          ].join('\n')
        : 'No specific habits were flagged. Follow the sections above.',
    ].join('\n'),
  );

  if (profile.tendencies.length > 0 && profile.avoid.length > 0) {
    const doItems = profile.tendencies
      .slice(0, 2)
      .map((item) => `Do: ${item}.`);
    const doNotItems = profile.avoid
      .slice(0, 2)
      .map((item) => `Do not: ${item}.`);
    sections.push(
      ['## Examples', bulletList([...doItems, ...doNotItems])].join('\n'),
    );
  }

  return sections.join('\n\n');
}

// A plain-language summary of the same profile, meant for a human to read
// rather than an assistant to follow. Reuses STYLE_DIMENSIONS so the scores
// list stays in sync with the profile UI.
export function generateStyleProfileDoc(profile: StyleProfile): string {
  const sections: string[] = [];

  sections.push('# Writing Style Profile');

  sections.push(
    [
      '## Scores',
      bulletList(
        STYLE_DIMENSIONS.map(
          (dimension) => `${dimension.label}: ${profile[dimension.key]}/100`,
        ),
      ),
    ].join('\n'),
  );

  sections.push(
    ['## Voice', joinOrFallback(profile.voice, 'Not specified.')].join('\n'),
  );
  sections.push(
    ['## Tone', joinOrFallback(profile.tone, 'Not specified.')].join('\n'),
  );

  sections.push(
    [
      '## Sentence Style',
      bulletList([
        `Typical length: ${profile.sentenceStyle.typicalLength}`,
        `Complexity: ${profile.sentenceStyle.complexity}`,
        `Rhythm: ${profile.sentenceStyle.rhythm}`,
      ]),
    ].join('\n'),
  );

  sections.push(
    [
      '## Vocabulary',
      bulletList([
        `Complexity: ${profile.vocabulary.complexity}`,
        `Jargon: ${profile.vocabulary.jargon}`,
        `Preferred words: ${joinOrFallback(profile.vocabulary.preferences, 'None specified.')}`,
      ]),
    ].join('\n'),
  );

  sections.push(
    [
      '## Structure',
      bulletList([
        `Preferred formats: ${joinOrFallback(profile.structure.preferredFormat, 'None specified.')}`,
        `Paragraph style: ${profile.structure.paragraphStyle}`,
        `Bullet usage: ${profile.structure.bulletUsage}`,
      ]),
    ].join('\n'),
  );

  sections.push(
    [
      '## Explanation Style',
      bulletList([
        `Approach: ${joinOrFallback(profile.explanationStyle.approach, 'None specified.')}`,
        `Uses examples: ${profile.explanationStyle.examples ? 'Yes' : 'No'}`,
        `Uses analogies: ${profile.explanationStyle.analogies ? 'Yes' : 'No'}`,
        `Shows reasoning: ${profile.explanationStyle.reasoning ? 'Yes' : 'No'}`,
      ]),
    ].join('\n'),
  );

  sections.push(
    [
      '## Tendencies',
      profile.tendencies.length > 0
        ? bulletList(profile.tendencies)
        : 'None recorded.',
    ].join('\n'),
  );
  sections.push(
    [
      '## Avoid',
      profile.avoid.length > 0 ? bulletList(profile.avoid) : 'None recorded.',
    ].join('\n'),
  );

  return sections.join('\n\n');
}

export function generatePrompts(profile: StyleProfile): GeneratedPrompt {
  return {
    systemPrompt: generateSystemPrompt(profile),
    styleProfileDoc: generateStyleProfileDoc(profile),
  };
}
