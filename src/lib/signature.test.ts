import { describe, it, expect } from 'vitest';
import { computeProfileSignature } from './signature';
import type { StyleProfile } from '../types/styleProfile';

const profile: StyleProfile = {
  voice: ['Direct'],
  tone: ['Warm'],
  directness: 80,
  formality: 40,
  technicalDepth: 70,
  verbosity: 55,
  humor: 30,
  empathy: 60,
  hedging: 25,
  sentenceStyle: {
    typicalLength: 'short',
    complexity: 'simple',
    rhythm: 'varied',
  },
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

describe('computeProfileSignature', () => {
  it('produces the same signature for the same profile', () => {
    expect(computeProfileSignature(profile)).toBe(
      computeProfileSignature({ ...profile }),
    );
  });

  it('is unaffected by key order', () => {
    const reordered: StyleProfile = {
      avoid: profile.avoid,
      tendencies: profile.tendencies,
      explanationStyle: profile.explanationStyle,
      structure: profile.structure,
      vocabulary: profile.vocabulary,
      sentenceStyle: profile.sentenceStyle,
      hedging: profile.hedging,
      empathy: profile.empathy,
      humor: profile.humor,
      verbosity: profile.verbosity,
      technicalDepth: profile.technicalDepth,
      formality: profile.formality,
      directness: profile.directness,
      tone: profile.tone,
      voice: profile.voice,
    };

    expect(computeProfileSignature(profile)).toBe(
      computeProfileSignature(reordered),
    );
  });

  it('changes when a field changes', () => {
    const changed: StyleProfile = { ...profile, directness: 10 };
    expect(computeProfileSignature(profile)).not.toBe(
      computeProfileSignature(changed),
    );
  });

  it('changes when an array field changes', () => {
    const changed: StyleProfile = { ...profile, voice: ['Blunt'] };
    expect(computeProfileSignature(profile)).not.toBe(
      computeProfileSignature(changed),
    );
  });
});
