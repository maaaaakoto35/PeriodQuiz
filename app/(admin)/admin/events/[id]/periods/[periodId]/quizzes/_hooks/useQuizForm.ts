'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz, updateQuiz, uploadQuizImage } from '@/app/_lib/actions/admin/quizzes';
import { quizFormSchema } from '@/app/_lib/actions/admin/quizzes/validation';
import type { QuizFormInput, ChoiceInput, QuizWithChoices } from '@/app/_lib/actions/admin/quizzes';
import { z } from 'zod';

interface UseQuizFormProps {
  periodId: number;
  eventId: number;
  initialData?: QuizWithChoices;
}

interface FormState {
  text: string;
  imageUrl: string;
  choices: ChoiceInput[];
}

export function useQuizForm({ periodId, eventId, initialData }: UseQuizFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    text: initialData?.text || '',
    imageUrl: initialData?.image_url || '',
    choices: initialData?.choices.map((c) => ({
      text: c.text,
      imageUrl: c.image_url || '',
      isCorrect: c.is_correct,
    })) || [
      { text: '', imageUrl: '', isCorrect: false },
      { text: '', imageUrl: '', isCorrect: false },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateField = (field: keyof FormState, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    // フィールド固有のエラーをクリア
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const updateChoice = (index: number, field: keyof ChoiceInput, value: any) => {
    setFormState((prev) => ({
      ...prev,
      choices: prev.choices.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[String(`choices.${index}.${field}`)];
      return newErrors;
    });
  };

  const addChoice = () => {
    if (formState.choices.length < 4) {
      setFormState((prev) => ({
        ...prev,
        choices: [...prev.choices, { text: '', imageUrl: '', isCorrect: false }],
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

  const uploadImage = async (file: File, type: 'question' | 'choice'): Promise<string | null> => {
    try {
      const result = await uploadQuizImage(file, type, initialData?.id);
      if (!result.success) {
        throw new Error(result.error || '画像のアップロードに失敗しました');
      }
      return result.imageUrl || null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('画像のアップロードに失敗しました');
    }
  };

  const validateForm = (): boolean => {
    setErrors({});
    try {
      quizFormSchema.parse({
        text: formState.text,
        imageUrl: formState.imageUrl,
        choices: formState.choices,
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const flattened = error.flatten().fieldErrors;
        for (const [key, messages] of Object.entries(flattened)) {
          if (Array.isArray(messages) && messages.length > 0) {
            newErrors[key] = String(messages[0]);
          }
        }
        setErrors(newErrors);
      }
      return false;
    }
  };

  const onSubmit = async () => {
    if (!validateForm()) {
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
