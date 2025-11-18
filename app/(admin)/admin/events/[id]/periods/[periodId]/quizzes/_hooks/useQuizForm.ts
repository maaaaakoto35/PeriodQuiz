'use client';

import type { QuizWithChoices } from '@/app/_lib/actions/admin/quizzes';
import { useQuizFormState } from './useQuizFormState';
import { useQuizFormSubmit } from './useQuizFormSubmit';
import { useQuizImageUpload } from './useQuizImageUpload';

interface UseQuizFormProps {
  periodId: number;
  eventId: number;
  initialData?: QuizWithChoices;
}

/**
 * 統合フック（後方互換性を保持）
 * 個別フックを組み合わせて使用
 */
export function useQuizForm({ periodId, eventId, initialData }: UseQuizFormProps) {
  const {
    formState,
    errors,
    updateField,
    updateChoice,
    addChoice,
    removeChoice,
    setErrors,
  } = useQuizFormState(initialData);

  const {
    isSubmitting,
    submitError,
    validateForm,
    onSubmit: handleSubmit,
  } = useQuizFormSubmit({ periodId, eventId, initialData });

  const { uploadImage } = useQuizImageUpload();

  const onSubmit = async () => {
    const validation = validateForm(formState);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    await handleSubmit(formState);
  };

  return {
    formState,
    errors,
    isSubmitting,
    submitError,
    updateField,
    updateChoice,
    addChoice,
    removeChoice,
    uploadImage,
    onSubmit,
  };
}
