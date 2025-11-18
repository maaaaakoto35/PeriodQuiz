"use client";

import { QuestionField } from "./components/QuestionField";
import { QuestionImageField } from "./components/QuestionImageField";
import { ChoiceFieldArray } from "./components/ChoiceFieldArray";
import { FormActions } from "./components/FormActions";
import { useQuizForm } from "../../_hooks/useQuizForm";
import type { QuizWithChoices } from "@/app/_lib/actions/admin/quizzes";

interface QuizFormProps {
  periodId: number;
  eventId: number;
  initialData?: QuizWithChoices;
}

export function QuizForm({ periodId, eventId, initialData }: QuizFormProps) {
  const {
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
  } = useQuizForm({ periodId, eventId, initialData });

  const handleQuestionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, "question");
      if (url) {
        updateField("imageUrl", url);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleChoiceImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, "choice");
      if (url) {
        updateChoice(index, "imageUrl", url);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* 問題文 */}
      <QuestionField
        value={formState.text}
        error={errors.text}
        onChange={(value) => updateField("text", value)}
      />

      {/* 問題画像 */}
      <QuestionImageField
        isUploaded={!!formState.imageUrl}
        onChange={handleQuestionImageUpload}
      />

      {/* 選択肢 */}
      <ChoiceFieldArray
        choices={formState.choices}
        onUpdateChoice={updateChoice}
        onAddChoice={addChoice}
        onRemoveChoice={removeChoice}
        onUploadImage={handleChoiceImageUpload}
      />

      {/* エラーメッセージ */}
      {errors.choices && (
        <p className="text-sm text-red-600">{errors.choices}</p>
      )}

      {/* 送信ボタン */}
      <FormActions
        isSubmitting={isSubmitting}
        isEditMode={!!initialData}
        eventId={eventId}
        periodId={periodId}
      />
    </form>
  );
}
