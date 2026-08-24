import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { APP_NAME } from './config';

describe('App shell', () => {
  it('renders the brand and primary navigation', () => {
    render(<App />);
    expect(screen.getByText(APP_NAME)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Assessment' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeTruthy();
  });

  it('shows the welcome screen at the default route', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /discover your writing style/i }),
    ).toBeTruthy();
  });
});
