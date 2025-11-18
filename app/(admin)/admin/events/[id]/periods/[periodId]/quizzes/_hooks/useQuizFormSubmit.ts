'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz, updateQuiz } from '@/app/_lib/actions/admin/quizzes';
import { quizFormSchema } from '@/app/_lib/actions/admin/quizzes/validation';
import type { QuizFormInput, ChoiceInput, QuizWithChoices } from '@/app/_lib/actions/admin/quizzes';
import { z } from 'zod';

interface FormState {
  text: string;
  imageUrl: string;
  choices: ChoiceInput[];
}

interface UseQuizFormSubmitProps {
  periodId: number;
  eventId: number;
  initialData?: QuizWithChoices;
}

interface UseQuizFormSubmitReturn {
  isSubmitting: boolean;
  submitError: string;
  validateForm: (formState: FormState) => { valid: boolean; errors: Record<string, string> };
  onSubmit: (formState: FormState) => Promise<void>;
}

/**
 * フォーム送信ロジック管理用カスタムフック
 * バリデーション・送信処理を担当
 */
export function useQuizFormSubmit({
  periodId,
  eventId,
  initialData,
}: UseQuizFormSubmitProps): UseQuizFormSubmitReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (
    formState: FormState
  ): { valid: boolean; errors: Record<string, string> } => {
    try {
      quizFormSchema.parse({
        text: formState.text,
        imageUrl: formState.imageUrl,
        choices: formState.choices,
      });
      return { valid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const flattened = error.flatten().fieldErrors;
        for (const [key, messages] of Object.entries(flattened)) {
          if (Array.isArray(messages) && messages.length > 0) {
            newErrors[key] = String(messages[0]);
          }
        }
        return { valid: false, errors: newErrors };
      }
      return { valid: false, errors: {} };
    }
  };

  const onSubmit = async (formState: FormState): Promise<void> => {
    const validation = validateForm(formState);
    if (!validation.valid) {
      // エラーは呼び出し側で処理
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const input = {
        text: formState.text,
        imageUrl: formState.imageUrl,
        choices: formState.choices,
      } as QuizFormInput;

      let result;
      if (initialData) {
        result = await updateQuiz({
          id: initialData.id,
          ...input,
        });
      } else {
        result = await createQuiz({
          periodId,
          ...input,
        });
      }

      if (!result.success) {
        setSubmitError(result.error || 'クイズの保存に失敗しました');
      } else {
        router.push(`/admin/events/${eventId}/periods/${periodId}/quizzes`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('クイズの保存中にエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    validateForm,
    onSubmit,
  };
}
