'use client';

import { useState } from 'react';
import type { ChoiceInput, QuizWithChoices } from '@/app/_lib/actions/admin/quizzes';

interface FormState {
  text: string;
  imageUrl: string;
  choices: ChoiceInput[];
}

interface UseQuizFormStateReturn {
  formState: FormState;
  errors: Record<string, string>;
  updateField: (field: keyof FormState, value: string | ChoiceInput[]) => void;
  updateChoice: (index: number, field: keyof ChoiceInput, value: string | boolean) => void;
  addChoice: () => void;
  removeChoice: (index: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearFieldError: (field: string) => void;
}

/**
 * フォーム状態管理用カスタムフック
 * 状態更新とエラーハンドリングを担当
 */
export function useQuizFormState(
  initialData?: QuizWithChoices
): UseQuizFormStateReturn {
  const [formState, setFormState] = useState<FormState>({
    text: initialData?.text || '',
    imageUrl: initialData?.image_url || '',
    choices: initialData?.choices.map((c) => ({
      text: c.text,
      imageUrl: c.image_url || '',
      isCorrect: c.is_correct,
      answerText: c.answer_text || '',
    })) || [
      { text: '', imageUrl: '', isCorrect: false, answerText: '' },
      { text: '', imageUrl: '', isCorrect: false, answerText: '' },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormState, value: string | ChoiceInput[]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field);
  };

  const updateChoice = (
    index: number,
    field: keyof ChoiceInput,
    value: string | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      choices: prev.choices.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
    clearFieldError(`choices.${index}.${field}`);
  };

  const addChoice = () => {
    if (formState.choices.length < 4) {
      setFormState((prev) => ({
        ...prev,
        choices: [...prev.choices, { text: '', imageUrl: '', isCorrect: false, answerText: '' }],
      }));
    }
  };

  const removeChoice = (index: number) => {
    if (formState.choices.length > 2) {
      setFormState((prev) => ({
        ...prev,
        choices: prev.choices.filter((_, i) => i !== index),
      }));
    }
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    formState,
    errors,
    updateField,
    updateChoice,
    addChoice,
    removeChoice,
    setErrors,
    clearFieldError,
  };
}
