import type { StyleProfile } from '../types/styleProfile';
import { STYLE_DIMENSIONS } from '../types/styleProfile';

// A single numeric dimension's before and after values and the change
// between them (after minus before). All 7 dimensions are always included,
// even when the delta is 0, so a comparison view can show the full picture.
export interface ScoreDelta {
  key: string;
  label: string;
  before: number;
  after: number;
  delta: number;
}

// Items present in the second profile but not the first (added) and items
// present in the first but not the second (removed), for one string-array
// field. Only included in ProfileDiff.tagFields when at least one item
// changed.
export interface TagFieldDiff {
  field: string;
  label: string;
  added: string[];
  removed: string[];
}

// A single-string field whose value differs between the two profiles. Only
// included in ProfileDiff.textFields when the value actually changed.
export interface TextFieldDiff {
  field: string;
  label: string;
  before: string;
  after: string;
}

// A boolean field whose value differs between the two profiles. Only
// included in ProfileDiff.booleanFields when the value actually changed.
export interface BooleanFieldDiff {
  field: string;
  label: string;
  before: boolean;
  after: boolean;
}

export interface ProfileDiff {
  scores: ScoreDelta[];
  tagFields: TagFieldDiff[];
  textFields: TextFieldDiff[];
  booleanFields: BooleanFieldDiff[];
}

interface TagFieldConfig {
  field: string;
  label: string;
  get: (profile: StyleProfile) => string[];
}

interface TextFieldConfig {
  field: string;
  label: string;
  get: (profile: StyleProfile) => string;
}

interface BooleanFieldConfig {
  field: string;
  label: string;
  get: (profile: StyleProfile) => boolean;
}

// The 7 string-array fields compared field by field, in the same order they
// appear on the profile page.
const TAG_FIELDS: TagFieldConfig[] = [
  { field: 'voice', label: 'Voice', get: (profile) => profile.voice },
  { field: 'tone', label: 'Tone', get: (profile) => profile.tone },
  {
    field: 'vocabulary.preferences',
    label: 'Vocabulary preferences',
    get: (profile) => profile.vocabulary.preferences,
  },
  {
    field: 'structure.preferredFormat',
    label: 'Preferred format',
    get: (profile) => profile.structure.preferredFormat,
  },
  {
    field: 'explanationStyle.approach',
    label: 'Explanation approach',
    get: (profile) => profile.explanationStyle.approach,
  },
  {
    field: 'tendencies',
    label: 'Tendencies',
    get: (profile) => profile.tendencies,
  },
  { field: 'avoid', label: 'Avoid', get: (profile) => profile.avoid },
];

// The 7 single-string fields compared field by field.
const TEXT_FIELDS: TextFieldConfig[] = [
  {
    field: 'sentenceStyle.typicalLength',
    label: 'Typical sentence length',
    get: (profile) => profile.sentenceStyle.typicalLength,
  },
  {
    field: 'sentenceStyle.complexity',
    label: 'Sentence complexity',
    get: (profile) => profile.sentenceStyle.complexity,
  },
  {
    field: 'sentenceStyle.rhythm',
    label: 'Sentence rhythm',
    get: (profile) => profile.sentenceStyle.rhythm,
  },
  {
    field: 'vocabulary.complexity',
    label: 'Vocabulary complexity',
    get: (profile) => profile.vocabulary.complexity,
  },
  {
    field: 'vocabulary.jargon',
    label: 'Vocabulary jargon',
    get: (profile) => profile.vocabulary.jargon,
  },
  {
    field: 'structure.paragraphStyle',
    label: 'Paragraph style',
    get: (profile) => profile.structure.paragraphStyle,
  },
  {
    field: 'structure.bulletUsage',
    label: 'Bullet usage',
    get: (profile) => profile.structure.bulletUsage,
  },
];

// The 3 boolean fields compared field by field.
const BOOLEAN_FIELDS: BooleanFieldConfig[] = [
  {
    field: 'explanationStyle.examples',
    label: 'Uses examples',
    get: (profile) => profile.explanationStyle.examples,
  },
  {
    field: 'explanationStyle.analogies',
    label: 'Uses analogies',
    get: (profile) => profile.explanationStyle.analogies,
  },
  {
    field: 'explanationStyle.reasoning',
    label: 'Shows its reasoning',
    get: (profile) => profile.explanationStyle.reasoning,
  },
];

// Compares two style profiles, typically an older version (a) against a newer
// one (b). Pure: reads both profiles and returns a plain description of what
// changed, with no side effects.
export function profileDiff(a: StyleProfile, b: StyleProfile): ProfileDiff {
  const scores: ScoreDelta[] = STYLE_DIMENSIONS.map((dimension) => {
    const before = a[dimension.key] as number;
    const after = b[dimension.key] as number;
    return {
      key: dimension.key,
      label: dimension.label,
      before,
      after,
      delta: after - before,
    };
  });

  const tagFields: TagFieldDiff[] = [];
  for (const config of TAG_FIELDS) {
    const before = config.get(a);
    const after = config.get(b);
    const added = after.filter((item) => !before.includes(item));
    const removed = before.filter((item) => !after.includes(item));
    if (added.length > 0 || removed.length > 0) {
      tagFields.push({
        field: config.field,
        label: config.label,
        added,
        removed,
      });
    }
  }

  const textFields: TextFieldDiff[] = [];
  for (const config of TEXT_FIELDS) {
    const before = config.get(a);
    const after = config.get(b);
    if (before !== after) {
      textFields.push({
        field: config.field,
        label: config.label,
        before,
        after,
      });
    }
  }

  const booleanFields: BooleanFieldDiff[] = [];
  for (const config of BOOLEAN_FIELDS) {
    const before = config.get(a);
    const after = config.get(b);
    if (before !== after) {
      booleanFields.push({
        field: config.field,
        label: config.label,
        before,
        after,
      });
    }
  }

  return { scores, tagFields, textFields, booleanFields };
}
