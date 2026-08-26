import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  STORAGE_KEYS,
  SCHEMA_VERSION,
  SPEECH_CONFIG,
  type SpeechProviderMode,
  type WhisperModelId,
} from '../config';

interface SettingsStore {
  speechMode: SpeechProviderMode;
  whisperModel: WhisperModelId;
  setSpeechMode: (mode: SpeechProviderMode) => void;
  setWhisperModel: (model: WhisperModelId) => void;
}

// User preferences that are not assessment data. Persisted separately so
// clearing assessment answers never resets the user's chosen settings.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      speechMode: SPEECH_CONFIG.defaultProviderMode,
      whisperModel: SPEECH_CONFIG.defaultModel,
      setSpeechMode: (speechMode) => set({ speechMode }),
      setWhisperModel: (whisperModel) => set({ whisperModel }),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
