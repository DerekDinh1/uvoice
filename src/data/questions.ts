import type { AssessmentQuestion } from '../types/assessment';

// The assessment: 12 exercises, each intentionally using a different mode of
// writing so the analyzer sees a broad sample of the user's natural style.
// Stored here, separate from any UI, per the architecture rules.
export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'natural-explanation',
    title: 'Explain Something You Know Well',
    prompt:
      'Pick something you understand deeply (a hobby, your job, how something everyday works) and explain it to a curious friend who knows nothing about it.',
    dimension: ['explanation-style', 'directness', 'vocabulary', 'examples'],
    suggestedLength: 'A paragraph or two',
  },
  {
    id: 'technical-explanation',
    title: 'Technical Explanation',
    prompt:
      'Explain a technical or complex concept from your field to a smart colleague who works in a different area. Assume they are capable but unfamiliar with the specifics.',
    dimension: ['technical-depth', 'vocabulary', 'structure', 'examples'],
    suggestedLength: 'A paragraph or two',
  },
  {
    id: 'disagreement',
    title: 'Respectful Disagreement',
    prompt:
      'Someone confidently states an opinion you think is wrong. Write how you would respond to them directly.',
    dimension: ['directness', 'confidence', 'empathy', 'hedging'],
  },
  {
    id: 'instruction',
    title: 'Give Clear Instructions',
    prompt:
      'Write step-by-step instructions for a task you know how to do well, for someone doing it for the first time.',
    dimension: ['structure', 'conciseness', 'directness'],
  },
  {
    id: 'persuasion',
    title: 'Make the Case',
    prompt:
      'Persuade a skeptical reader to try something you genuinely love: a tool, a book, a habit, a place. Win them over.',
    dimension: ['confidence', 'directness', 'emotional-tone', 'examples'],
    suggestedLength: 'About a paragraph',
  },
  {
    id: 'constructive-criticism',
    title: 'Constructive Feedback',
    prompt:
      'A peer shares work that has real, significant problems. Write the feedback you would give them.',
    dimension: ['empathy', 'directness', 'hedging'],
  },
  {
    id: 'casual-communication',
    title: 'Casual Message',
    prompt:
      'Text a close friend to tell them about your weekend, exactly the way you normally would.',
    dimension: ['formality', 'humor', 'sentence-length'],
    suggestedLength: 'A few sentences',
  },
  {
    id: 'concise-explanation',
    title: 'Say It Briefly',
    prompt:
      'Summarize a complex idea you care about in the fewest words that still do it justice.',
    dimension: ['conciseness', 'directness'],
    suggestedLength: 'Two or three sentences',
  },
  {
    id: 'professional-communication',
    title: 'Professional Email',
    prompt:
      'Write an email to a client or stakeholder letting them know a deadline has slipped and proposing a new plan.',
    dimension: ['formality', 'structure', 'empathy'],
  },
  {
    id: 'storytelling',
    title: 'Tell a Short Story',
    prompt:
      'Describe a memorable experience from your life as a short story. Set the scene and take the reader through it.',
    dimension: ['emotional-tone', 'sentence-length', 'vocabulary'],
    suggestedLength: 'A paragraph or two',
  },
  {
    id: 'comparison',
    title: 'Compare Two Options',
    prompt:
      'Compare two tools, products, or approaches you know, then recommend one and explain why.',
    dimension: ['structure', 'technical-depth', 'directness'],
  },
  {
    id: 'opinion-argument',
    title: 'Take a Stance',
    prompt:
      'Argue for an opinion you hold strongly. Make your reasoning clear and stand behind it.',
    dimension: ['confidence', 'directness', 'hedging'],
    suggestedLength: 'About a paragraph',
  },
];
