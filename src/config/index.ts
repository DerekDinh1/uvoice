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

// Per-store persisted-schema versions. Each store carries its own so bumping one
// (after a breaking shape change) never discards the others' saved state.
export const SCHEMA_VERSIONS = {
  appState: 1,
  settings: 1,
  theme: 1,
  analysis: 1,
} as const;

// Every LocalStorage key the app uses. The API key is stored under its own key,
// separate from app state, and only when the user opts in (Phase 3).
export const STORAGE_KEYS = {
  appState: 'prompt-architect:state',
  theme: 'prompt-architect:theme',
  settings: 'prompt-architect:settings',
  analysis: 'prompt-architect:analysis',
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
  'base.en': {
    label: 'Base (more accurate)',
    repo: 'onnx-community/whisper-base.en',
  },
  'tiny.en': {
    label: 'Tiny (faster, smaller)',
    repo: 'onnx-community/whisper-tiny.en',
  },
} as const;

export type WhisperModelId = keyof typeof WHISPER_MODELS;

// How a spoken answer becomes text. 'mock' returns a fixed sample transcript with
// no download; 'whisper' runs the real model on the device.
export const SPEECH_PROVIDER_MODES = ['mock', 'whisper'] as const;
export type SpeechProviderMode = (typeof SPEECH_PROVIDER_MODES)[number];

export const SPEECH_PROVIDER_LABELS: Record<
  SpeechProviderMode,
  { label: string; description: string }
> = {
  mock: {
    label: 'Demo transcript',
    description:
      'Returns a fixed sample sentence instead of your words. Nothing is downloaded, so the flow works instantly.',
  },
  whisper: {
    label: 'On-device Whisper',
    description:
      'Transcribes what you actually said, running the model in your browser. The first use downloads the model.',
  },
};

export const SPEECH_CONFIG = {
  // Real transcription by default; demo mode stays available for slow
  // connections or devices that struggle with the model.
  defaultProviderMode: 'whisper',
  defaultModel: 'base.en',
  // Whisper expects 16 kHz mono audio; the provider resamples to this.
  targetSampleRate: 16000,
  // ONNX Runtime requires its WASM binaries to match the JS build exactly, so
  // this version must track the installed onnxruntime-web. Serving them from a
  // CDN keeps the deployed site small.
  ortWasmBaseUrl:
    'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0-dev.20250409-89f8206ba4/dist/',
  // Weight precision per sub-model. The default 4-bit decoder weights fail to
  // build an inference session in this ONNX Runtime build, so the encoder runs
  // fp32 and the decoder uses 8-bit, which keeps the download reasonable.
  dtype: { encoder_model: 'fp32', decoder_model_merged: 'q8' },
} as const;

// Shared score semantics for profile dimensions.
// 0 = very low, 50 = moderate, 100 = very high.
export const SCORE_SCALE = { min: 0, mid: 50, max: 100 } as const;
