// Shared button styling. Variants are composed with the base so padding and
// colour stay consistent across the app instead of being retyped per component.

export const BUTTON_BASE =
  'rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export const BUTTON_VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:opacity-90',
  secondary: 'bg-surface-2 text-text hover:opacity-80',
  outline: 'border border-border bg-surface-2 text-text hover:opacity-80',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'text-muted hover:text-danger',
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClass(
  variant: ButtonVariant,
  extra = 'px-4 py-2',
): string {
  return `${BUTTON_BASE} ${extra} ${BUTTON_VARIANTS[variant]}`;
}
