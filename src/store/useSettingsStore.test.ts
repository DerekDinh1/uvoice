import { beforeEach, describe, it, expect } from 'vitest';
import { useSettingsStore } from './useSettingsStore';
import { STORAGE_KEYS, SPEECH_CONFIG } from '../config';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({
    speechMode: SPEECH_CONFIG.defaultProviderMode,
    whisperModel: SPEECH_CONFIG.defaultModel,
  });
});

describe('useSettingsStore', () => {
  it('defaults to on-device Whisper with the base model', () => {
    expect(useSettingsStore.getState().speechMode).toBe('whisper');
    expect(useSettingsStore.getState().whisperModel).toBe('base.en');
  });

  it('persists a switch to demo transcription', () => {
    useSettingsStore.getState().setSpeechMode('mock');
    expect(useSettingsStore.getState().speechMode).toBe('mock');
    expect(localStorage.getItem(STORAGE_KEYS.settings)).toContain('mock');
  });

  it('persists the selected model', () => {
    useSettingsStore.getState().setWhisperModel('tiny.en');
    expect(useSettingsStore.getState().whisperModel).toBe('tiny.en');
    expect(localStorage.getItem(STORAGE_KEYS.settings)).toContain('tiny.en');
  });
});
