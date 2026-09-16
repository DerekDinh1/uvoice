import { describe, it, expect } from 'vitest';
import { profileDiff } from './profileDiff';
import type { StyleProfile } from '../types/styleProfile';

const baseProfile: StyleProfile = {
  voice: ['Direct', 'Careful'],
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

describe('profileDiff', () => {
  it('computes score deltas as after minus before, for every dimension', () => {
    const changed: StyleProfile = {
      ...baseProfile,
      directness: baseProfile.directness + 15,
      formality: baseProfile.formality - 5,
    };

    const diff = profileDiff(baseProfile, changed);

    expect(diff.scores).toHaveLength(7);
    expect(
      diff.scores.find((score) => score.key === 'directness'),
    ).toMatchObject({
      before: 80,
      after: 95,
      delta: 15,
    });
    expect(
      diff.scores.find((score) => score.key === 'formality'),
    ).toMatchObject({
      before: 40,
      after: 35,
      delta: -5,
    });
    // Dimensions that did not change still appear, with a delta of 0.
    expect(diff.scores.find((score) => score.key === 'humor')).toMatchObject({
      before: 30,
      after: 30,
      delta: 0,
    });
  });

  it('detects added and removed items in string-array fields', () => {
    const changed: StyleProfile = {
      ...baseProfile,
      voice: ['Direct', 'Blunt'],
    };

    const diff = profileDiff(baseProfile, changed);

    const voiceDiff = diff.tagFields.find((field) => field.field === 'voice');
    expect(voiceDiff?.added).toEqual(['Blunt']);
    expect(voiceDiff?.removed).toEqual(['Careful']);

    // Unaffected array fields are left out entirely.
    expect(
      diff.tagFields.find((field) => field.field === 'tone'),
    ).toBeUndefined();
  });

  it('detects changed string and boolean fields', () => {
    const changed: StyleProfile = {
      ...baseProfile,
      sentenceStyle: { ...baseProfile.sentenceStyle, complexity: 'complex' },
      explanationStyle: {
        ...baseProfile.explanationStyle,
        analogies: !baseProfile.explanationStyle.analogies,
      },
    };

    const diff = profileDiff(baseProfile, changed);

    expect(diff.textFields).toContainEqual({
      field: 'sentenceStyle.complexity',
      label: 'Sentence complexity',
      before: 'simple',
      after: 'complex',
    });
    expect(diff.booleanFields).toContainEqual({
      field: 'explanationStyle.analogies',
      label: 'Uses analogies',
      before: false,
      after: true,
    });
    // Unaffected string and boolean fields are left out entirely.
    expect(
      diff.textFields.find((field) => field.field === 'sentenceStyle.rhythm'),
    ).toBeUndefined();
    expect(
      diff.booleanFields.find(
        (field) => field.field === 'explanationStyle.examples',
      ),
    ).toBeUndefined();
  });

  it('produces no tag, text, or boolean changes for identical profiles', () => {
    const diff = profileDiff(baseProfile, { ...baseProfile });

    expect(diff.scores.every((score) => score.delta === 0)).toBe(true);
    expect(diff.tagFields).toEqual([]);
    expect(diff.textFields).toEqual([]);
    expect(diff.booleanFields).toEqual([]);
  });
});
