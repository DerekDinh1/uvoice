import { beforeEach, describe, it, expect } from 'vitest';
import { useAppStore, countAnswered } from './useAppStore';
import { QUESTIONS } from '../data/questions';
import { STORAGE_KEYS } from '../config';

const firstId = QUESTIONS[0].id;
const secondId = QUESTIONS[1].id;
const lastIndex = QUESTIONS.length - 1;

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().restartAssessment();
});

describe('useAppStore assessment slice', () => {
  it('records a response with text and a timestamp', () => {
    useAppStore.getState().setResponse(firstId, 'hello world');
    const response = useAppStore.getState().responses[firstId];
    expect(response.text).toBe('hello world');
    expect(typeof response.updatedAt).toBe('number');
  });

  it('clamps navigation at both ends', () => {
    useAppStore.getState().previous();
    expect(useAppStore.getState().currentIndex).toBe(0);

    useAppStore.getState().goTo(999);
    expect(useAppStore.getState().currentIndex).toBe(lastIndex);

    useAppStore.getState().next();
    expect(useAppStore.getState().currentIndex).toBe(lastIndex);
  });

  it('persists responses to localStorage (survives a refresh)', () => {
    useAppStore.getState().setResponse(firstId, 'persisted answer');
    const raw = localStorage.getItem(STORAGE_KEYS.appState);
    expect(raw).toBeTruthy();
    expect(raw).toContain('persisted answer');
  });

  it('restart clears responses, index, and completion', () => {
    useAppStore.getState().setResponse(secondId, 'x');
    useAppStore.getState().goTo(3);
    useAppStore.getState().markComplete();

    useAppStore.getState().restartAssessment();

    const state = useAppStore.getState();
    expect(Object.keys(state.responses)).toHaveLength(0);
    expect(state.currentIndex).toBe(0);
    expect(state.completedAt).toBeNull();
  });

  it('does not count whitespace-only responses as answered', () => {
    useAppStore.getState().setResponse(firstId, '   \n  ');
    expect(countAnswered(useAppStore.getState().responses)).toBe(0);
  });

  it('counts only non-empty responses', () => {
    useAppStore.getState().setResponse(firstId, 'real answer');
    useAppStore.getState().setResponse(secondId, '');
    expect(countAnswered(useAppStore.getState().responses)).toBe(1);
  });
});
