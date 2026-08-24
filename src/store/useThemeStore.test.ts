import { beforeEach, describe, it, expect } from 'vitest';
import { useThemeStore } from './useThemeStore';
import { STORAGE_KEYS } from '../config';

beforeEach(() => {
  localStorage.clear();
  useThemeStore.getState().setMode('system');
});

describe('useThemeStore', () => {
  it('defaults to system', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('updates and persists the selected mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toContain('dark');
  });
});
