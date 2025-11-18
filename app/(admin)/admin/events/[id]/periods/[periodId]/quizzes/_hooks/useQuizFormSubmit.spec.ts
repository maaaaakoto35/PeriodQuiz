import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizFormSubmit } from './useQuizFormSubmit';
import * as quizActions from '@/app/_lib/actions/admin/quizzes';

vi.mock('@/app/_lib/actions/admin/quizzes', () => ({
  createQuiz: vi.fn(),
  updateQuiz: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('useQuizFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const formState = {
    text: 'Test Question',
    imageUrl: 'https://example.com/image.jpg',
    choices: [
      { text: 'Option 1', imageUrl: '', isCorrect: true },
      { text: 'Option 2', imageUrl: '', isCorrect: false },
    ],
  };

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useQuizFormSubmit({
        periodId: 1,
        eventId: 1,
      })
    );

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBe('');
  });

  it('should validate form correctly', () => {
    const { result } = renderHook(() =>
      useQuizFormSubmit({
        periodId: 1,
        eventId: 1,
      })
    );

    const validation = result.current.validateForm(formState);
    expect(validation.valid).toBe(true);
  });

  it('should catch validation errors', () => {
    const { result } = renderHook(() =>
      useQuizFormSubmit({
        periodId: 1,
        eventId: 1,
      })
    );

    const invalidFormState = {
      text: '',
      imageUrl: '',
      choices: [],
    };

    const validation = result.current.validateForm(invalidFormState);
    expect(validation.valid).toBe(false);
    expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
  });
});
