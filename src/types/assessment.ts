// Writing behaviors a question is designed to reveal. Kept as documented string
// constants so the analysis phase (Phase 3) can map answers to profile scores.
export const DIMENSIONS = [
  'directness',
  'formality',
  'vocabulary',
  'sentence-length',
  'conciseness',
  'technical-depth',
  'humor',
  'confidence',
  'hedging',
  'empathy',
  'explanation-style',
  'structure',
  'examples',
  'emotional-tone',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export interface AssessmentQuestion {
  id: string;
  title: string;
  prompt: string;
  dimension: Dimension[];
  suggestedLength?: string;
}

export interface AssessmentResponse {
  questionId: string;
  text: string;
  updatedAt: number;
}
