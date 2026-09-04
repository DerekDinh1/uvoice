import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { APP_NAME } from './config';

describe('App shell', () => {
  it('renders the brand and primary navigation', () => {
    render(<App />);
    // The brand renders in both the desktop sidebar and the small-screen top
    // bar; only one is visible at a time, but both exist in the DOM.
    expect(screen.getAllByText(APP_NAME).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Assessment' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeTruthy();
  });

  it('shows the welcome screen at the default route', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /discover your writing style/i }),
    ).toBeTruthy();
  });

  it('moves focus to the main content region on route change', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: 'Assessment' }));
    await waitFor(() => {
      expect(document.activeElement?.id).toBe('main-content');
    });
  });
});
