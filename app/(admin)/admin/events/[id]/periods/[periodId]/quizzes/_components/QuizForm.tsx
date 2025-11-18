"use client";

import { ChoiceFieldArray } from "./ChoiceFieldArray";
import { useQuizForm } from "../_hooks/useQuizForm";
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
      <div>
        <label
          htmlFor="text"
          className="
          block text-sm font-medium text-gray-700
          mb-1
        "
        >
          問題文 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="text"
          value={formState.text}
          onChange={(e) => updateField("text", e.target.value)}
          placeholder="例: 東京の首都はどこでしょう?"
          className="
            w-full rounded-md border border-gray-300
            bg-white px-3 py-2
            text-gray-900 placeholder-gray-500
            focus:border-blue-500 focus:outline-none
            focus:ring-1 focus:ring-blue-500
          "
          rows={3}
        />
        {errors.text && (
          <p className="mt-1 text-sm text-red-600">{errors.text}</p>
        )}
      </div>

      {/* 問題画像 */}
      <div>
        <label
          htmlFor="questionImage"
          className="
          block text-sm font-medium text-gray-700
          mb-1
        "
        >
          問題画像 （任意）
        </label>
        <div className="flex items-center gap-4">
          <input
            id="questionImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleQuestionImageUpload}
            className="
              flex-1 rounded-md border border-gray-300
              bg-white px-3 py-2
              text-gray-900
              text-sm
            "
          />
          {formState.imageUrl && (
            <span className="text-sm text-green-600">✓ アップロード済み</span>
          )}
        </div>
      </div>

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
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            rounded-md bg-blue-600
            px-4 py-2
            text-white font-medium
            hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isSubmitting
            ? "保存中..."
            : initialData
            ? "クイズを更新"
            : "クイズを作成"}
        </button>
        <a
          href={`/admin/events/${eventId}/periods/${periodId}/quizzes`}
          className="
            rounded-md bg-gray-200
            px-4 py-2
            text-gray-800 font-medium
            hover:bg-gray-300
            transition-colors
            text-center
          "
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
