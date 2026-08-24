import { describe, it, expect } from 'vitest';
import { resolveIsDark, applyTheme } from './theme';

describe('theme resolution', () => {
  it('resolves explicit modes without consulting the OS', () => {
    expect(resolveIsDark('light')).toBe(false);
    expect(resolveIsDark('dark')).toBe(true);
  });

  it('applyTheme toggles the .dark class on the document root', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
