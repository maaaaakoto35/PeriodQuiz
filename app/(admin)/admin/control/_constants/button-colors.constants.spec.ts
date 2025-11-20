import { describe, it, expect } from 'vitest';
import { BUTTON_COLORS } from './button-colors.constants';
import { QuizScreen } from '@/app/_lib/types/quiz';

describe('button-colors.constants', () => {
  it('should have color scheme for all quiz screens', () => {
    const expectedScreens: QuizScreen[] = [
      'waiting',
      'question',
      'answer',
      'break',
      'period_result',
      'final_result',
    ];

    expectedScreens.forEach((screen) => {
      expect(BUTTON_COLORS[screen]).toBeDefined();
    });
  });

  it('should have all required color properties', () => {
    const expectedScreens: QuizScreen[] = [
      'waiting',
      'question',
      'answer',
      'break',
      'period_result',
      'final_result',
    ];

    expectedScreens.forEach((screen) => {
      const scheme = BUTTON_COLORS[screen];
      expect(scheme.bg).toBeDefined();
      expect(scheme.border).toBeDefined();
      expect(scheme.hover).toBeDefined();
      expect(scheme.text).toBeDefined();
    });
  });

  it('should have Tailwind CSS class names', () => {
    const scheme = BUTTON_COLORS.waiting;
    expect(scheme.bg).toMatch(/^bg-/);
    expect(scheme.border).toMatch(/^border-/);
    expect(scheme.hover).toMatch(/hover:/);
    expect(scheme.text).toMatch(/^text-/);
  });

  it('should have consistent color families for each screen', () => {
    // waiting - slate
    expect(BUTTON_COLORS.waiting.bg).toContain('slate');
    expect(BUTTON_COLORS.waiting.border).toContain('slate');
    expect(BUTTON_COLORS.waiting.text).toContain('slate');

    // question - amber
    expect(BUTTON_COLORS.question.bg).toContain('amber');
    expect(BUTTON_COLORS.question.border).toContain('amber');
    expect(BUTTON_COLORS.question.text).toContain('amber');

    // answer - emerald
    expect(BUTTON_COLORS.answer.bg).toContain('emerald');
    expect(BUTTON_COLORS.answer.border).toContain('emerald');
    expect(BUTTON_COLORS.answer.text).toContain('emerald');
  });
});
