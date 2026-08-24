import { THEME_MODES, type ThemeMode } from '../../config';
import { useThemeStore } from '../../store/useThemeStore';

const LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Auto',
};

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div
      className="flex rounded-md border border-border bg-surface-2 p-0.5 text-xs"
      role="group"
      aria-label="Theme"
    >
      {THEME_MODES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setMode(option)}
          aria-pressed={mode === option}
          className={`flex-1 rounded px-2 py-1 font-medium transition-colors ${
            mode === option
              ? 'bg-accent text-accent-fg'
              : 'text-muted hover:text-text'
          }`}
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}
