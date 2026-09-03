import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  STORAGE_KEYS,
  SCHEMA_VERSION,
  SPEECH_CONFIG,
  LLM_CONFIG,
  type SpeechProviderMode,
  type WhisperModelId,
} from '../config';
import type { LLMProviderMode } from '../types/llm';

interface SettingsStore {
  speechMode: SpeechProviderMode;
  whisperModel: WhisperModelId;
  analysisMode: LLMProviderMode;
  apiKey: string;
  setSpeechMode: (mode: SpeechProviderMode) => void;
  setWhisperModel: (model: WhisperModelId) => void;
  setAnalysisMode: (mode: LLMProviderMode) => void;
  setApiKey: (key: string) => void;
}

// User preferences, persisted separately from assessment data. The API key is
// deliberately excluded from persistence: it lives in memory for the session
// only, so it is never written to LocalStorage.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      speechMode: SPEECH_CONFIG.defaultProviderMode,
      whisperModel: SPEECH_CONFIG.defaultModel,
      analysisMode: LLM_CONFIG.defaultProvider,
      apiKey: '',
      setSpeechMode: (speechMode) => set({ speechMode }),
      setWhisperModel: (whisperModel) => set({ whisperModel }),
      setAnalysisMode: (analysisMode) => set({ analysisMode }),
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        speechMode: state.speechMode,
        whisperModel: state.whisperModel,
        analysisMode: state.analysisMode,
      }),
    },
  ),
);
