import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizFormState } from './useQuizFormState';

describe('useQuizFormState', () => {
  it('should initialize with default form state', () => {
    const { result } = renderHook(() => useQuizFormState());

    expect(result.current.formState.text).toBe('');
    expect(result.current.formState.imageUrl).toBe('');
    expect(result.current.formState.choices).toHaveLength(2);
  });

  it('should initialize with initial data when provided', () => {
    const initialData = {
      id: 1,
      text: 'Test Question',
      image_url: 'https://example.com/image.jpg',
      order_num: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      choices: [
        { id: 1, question_id: 1, text: 'Option 1', image_url: '', is_correct: true, order_num: 1, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, question_id: 1, text: 'Option 2', image_url: '', is_correct: false, order_num: 2, created_at: '2024-01-01T00:00:00Z' },
      ],
    };

    const { result } = renderHook(() => useQuizFormState(initialData));

    expect(result.current.formState.text).toBe('Test Question');
    expect(result.current.formState.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.current.formState.choices).toHaveLength(2);
  });

  it('should update field correctly', () => {
    const { result } = renderHook(() => useQuizFormState());

    act(() => {
      result.current.updateField('text', 'New Question');
    });

    expect(result.current.formState.text).toBe('New Question');
  });

  it('should add choice correctly', () => {
    const { result } = renderHook(() => useQuizFormState());

    act(() => {
      result.current.addChoice();
    });

    expect(result.current.formState.choices).toHaveLength(3);
  });

  it('should remove choice correctly', () => {
    const { result } = renderHook(() => useQuizFormState());

    // まず3つの選択肢を追加
    act(() => {
      result.current.addChoice();
    });

    expect(result.current.formState.choices).toHaveLength(3);

    // 1つ削除
    act(() => {
      result.current.removeChoice(0);
    });

    expect(result.current.formState.choices).toHaveLength(2);
  });

  it('should not remove choice if only 2 remain', () => {
    const { result } = renderHook(() => useQuizFormState());

    // 初期状態は2つ
    expect(result.current.formState.choices).toHaveLength(2);

    // 削除しようとしても、2つ未満にはならないため実行されない
    act(() => {
      result.current.removeChoice(0);
    });

    // 2つのまま
    expect(result.current.formState.choices).toHaveLength(2);
  });

  it('should update choice field correctly', () => {
    const { result } = renderHook(() => useQuizFormState());

    act(() => {
      result.current.updateChoice(0, 'text', 'Updated Choice');
    });

    expect(result.current.formState.choices[0].text).toBe('Updated Choice');
  });

  it('should clear field error when field is updated', () => {
    const { result } = renderHook(() => useQuizFormState());

    act(() => {
      result.current.setErrors({ text: 'Error message' });
    });

    expect(result.current.errors.text).toBe('Error message');

    act(() => {
      result.current.updateField('text', 'Updated');
    });

    expect(result.current.errors.text).toBeUndefined();
  });
});
