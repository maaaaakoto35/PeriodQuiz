import { describe, it, expect } from 'vitest';
import { SCREEN_NAMES, ALL_SCREENS } from './screen.constants';
import { QuizScreen } from '@/app/_lib/types/quiz';

describe('screen.constants', () => {
  describe('SCREEN_NAMES', () => {
    it('should have mapping for all quiz screens', () => {
      const expectedScreens: QuizScreen[] = [
        'waiting',
        'question_reading',
        'question',
        'answer_check',
        'answer',
        'break',
        'period_result',
        'final_result',
      ];

      expectedScreens.forEach((screen) => {
        expect(SCREEN_NAMES[screen]).toBeDefined();
        expect(typeof SCREEN_NAMES[screen]).toBe('string');
        expect(SCREEN_NAMES[screen].length).toBeGreaterThan(0);
      });
    });

    it('should return Japanese display names', () => {
      expect(SCREEN_NAMES.waiting).toBe('待機中');
      expect(SCREEN_NAMES.question_reading).toBe('問題読み上げ');
      expect(SCREEN_NAMES.question).toBe('問題表示');
      expect(SCREEN_NAMES.answer_check).toBe('アンサーチェック');
      expect(SCREEN_NAMES.answer).toBe('正解発表');
      expect(SCREEN_NAMES.break).toBe('休憩');
      expect(SCREEN_NAMES.period_result).toBe('ピリオド結果');
      expect(SCREEN_NAMES.final_result).toBe('最終結果');
    });
  });

  describe('ALL_SCREENS', () => {
    it('should contain all quiz screens', () => {
      const expectedScreens: QuizScreen[] = [
        'waiting',
        'question_reading',
        'question',
        'answer_check',
        'answer',
        'break',
        'period_result',
        'final_result',
      ];

      expect(ALL_SCREENS).toEqual(expectedScreens);
    });

    it('should have correct length', () => {
      expect(ALL_SCREENS).toHaveLength(8);
    });

    it('should not have duplicates', () => {
      const uniqueScreens = new Set(ALL_SCREENS);
      expect(uniqueScreens.size).toBe(ALL_SCREENS.length);
    });
  });
});
