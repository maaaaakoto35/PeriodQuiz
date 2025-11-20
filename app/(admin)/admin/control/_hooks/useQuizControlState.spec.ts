import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  useQuizControlState,
  type QuizControlState,
} from './useQuizControlState';

describe('useQuizControlState', () => {
  const mockInitialState: QuizControlState = {
    currentScreen: 'waiting',
    currentPeriodId: 1,
    currentQuestionId: null,
    periodName: 'ピリオド1',
    questionText: '問題1',
  };

  it('should initialize state correctly', () => {
    const { result } = renderHook(() =>
      useQuizControlState(mockInitialState)
    );

    expect(result.current.state).toEqual(mockInitialState);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.userCount).toBe(0);
  });

  it('should update state with setState', () => {
    const { result } = renderHook(() =>
      useQuizControlState(mockInitialState)
    );

    const newState: QuizControlState = {
      currentScreen: 'question',
      currentPeriodId: 1,
      currentQuestionId: 1,
      periodName: 'ピリオド1',
      questionText: '問題1テキスト',
    };

    act(() => {
      result.current.setState(newState);
    });

    expect(result.current.state).toEqual(newState);
  });

  it('should set isUpdating flag', () => {
    const { result } = renderHook(() =>
      useQuizControlState(mockInitialState)
    );

    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.setIsUpdating(true);
    });

    expect(result.current.isUpdating).toBe(true);

    act(() => {
      result.current.setIsUpdating(false);
    });

    expect(result.current.isUpdating).toBe(false);
  });

  it('should set error message', () => {
    const { result } = renderHook(() =>
      useQuizControlState(mockInitialState)
    );

    expect(result.current.error).toBeNull();

    act(() => {
      result.current.setError('エラーが発生しました');
    });

    expect(result.current.error).toBe('エラーが発生しました');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should set user count', () => {
    const { result } = renderHook(() =>
      useQuizControlState(mockInitialState)
    );

    expect(result.current.userCount).toBe(0);

    act(() => {
      result.current.setUserCount(15);
    });

    expect(result.current.userCount).toBe(15);
  });

  it('should handle null initial state', () => {
    const { result } = renderHook(() => useQuizControlState(null));

    expect(result.current.state).toBeNull();
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.userCount).toBe(0);
  });
});
