// Central configuration. No string literals for routes, storage keys, model
// names, theme, speech, or scale semantics should live anywhere else.

export const APP_NAME = 'Prompt Architect';

export const ROUTES = {
  welcome: '/',
  assessment: '/assessment',
  profile: '/profile',
  prompt: '/prompt',
  settings: '/settings',
} as const;

// Primary navigation. The Welcome screen is reachable via the brand link.
export const NAV_ITEMS = [
  { label: 'Assessment', path: ROUTES.assessment },
  { label: 'Profile', path: ROUTES.profile },
  { label: 'Prompt', path: ROUTES.prompt },
  { label: 'Settings', path: ROUTES.settings },
] as const;

// Bumped when the persisted LocalStorage shape changes in a breaking way, so a
// future migration can detect and upgrade older saved state. (Used from Phase 2.)
export const SCHEMA_VERSION = 1;

// Every LocalStorage key the app uses. The API key is stored under its own key,
// separate from app state, and only when the user opts in (Phase 3).
export const STORAGE_KEYS = {
  appState: 'prompt-architect:state',
  apiKey: 'prompt-architect:openai-key',
  theme: 'prompt-architect:theme',
} as const;

// Theme options. "system" follows the OS preference.
export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

// LLM settings are centralized here now but stay unused until Phase 3.
export const LLM_CONFIG = {
  defaultProvider: 'mock',
  apiBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
} as const;

// Speech (Phase 2.5). Whisper models are loaded lazily from the Hugging Face
// CDN via Transformers.js; audio is transcribed locally and never uploaded.
export const WHISPER_MODELS = {
  'base.en': { label: 'Base (more accurate)', repo: 'Xenova/whisper-base.en' },
  'tiny.en': { label: 'Tiny (faster, smaller)', repo: 'Xenova/whisper-tiny.en' },
} as const;

export type WhisperModelId = keyof typeof WHISPER_MODELS;

export const SPEECH_CONFIG = {
  // 'mock' works with no download; 'whisper' runs the real model (Step 2+).
  defaultProviderMode: 'mock',
  defaultModel: 'base.en',
  // Whisper expects 16 kHz mono audio; the provider resamples to this.
  targetSampleRate: 16000,
} as const;

// Shared score semantics for profile dimensions.
// 0 = very low, 50 = moderate, 100 = very high.
export const SCORE_SCALE = { min: 0, mid: 50, max: 100 } as const;
