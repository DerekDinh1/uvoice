import type { ThemeMode } from '../config';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function prefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(DARK_QUERY).matches;
}

// Resolves a theme mode to a concrete light/dark decision.
export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return prefersDark();
}

// Toggles the .dark class on <html>, which is what the CSS tokens key off.
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolveIsDark(mode));
}

// Notifies when the OS theme changes; returns an unsubscribe function.
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
