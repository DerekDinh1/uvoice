import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentPage } from './AssessmentPage';
import { useAppStore } from '../store/useAppStore';
import { QUESTIONS } from '../data/questions';

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().restartAssessment();
});

describe('AssessmentPage', () => {
  it('shows the first question and progress on load', () => {
    render(<AssessmentPage />);
    expect(screen.getByText(QUESTIONS[0].title)).toBeTruthy();
    expect(screen.getByText(/Question 1 of/)).toBeTruthy();
  });

  it('saves typed input to the store', () => {
    render(<AssessmentPage />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'my answer' },
    });
    expect(useAppStore.getState().responses[QUESTIONS[0].id].text).toBe(
      'my answer',
    );
  });

  it('advances to the next question when Next is clicked', () => {
    render(<AssessmentPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(QUESTIONS[1].title)).toBeTruthy();
    expect(useAppStore.getState().currentIndex).toBe(1);
  });

  it('disables Previous on the first question', () => {
    render(<AssessmentPage />);
    const previous = screen.getByRole('button', {
      name: 'Previous',
    }) as HTMLButtonElement;
    expect(previous.disabled).toBe(true);
  });

  it('keeps a typed answer visible after navigating away and back', () => {
    render(<AssessmentPage />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'remember me' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
      'remember me',
    );
  });
});
