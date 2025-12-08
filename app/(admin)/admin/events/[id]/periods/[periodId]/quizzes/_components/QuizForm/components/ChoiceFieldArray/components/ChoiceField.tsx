"use client";

import type { ChoiceInput } from "@/app/_lib/actions/admin/quizzes";

interface ChoiceFieldProps {
  choice: ChoiceInput;
  index: number;
  totalChoices: number;
  onUpdateField: (field: keyof ChoiceInput, value: string | boolean) => void;
  onRemove: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCorrectChange: (isCorrect: boolean) => void;
}

export function ChoiceField({
  choice,
  index,
  totalChoices,
  onUpdateField,
  onRemove,
  onUploadImage,
  onCorrectChange,
}: ChoiceFieldProps) {
  return (
    <div
      className="
        rounded-lg border border-gray-200
        bg-white
        p-4
        space-y-3
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          選択肢 {index + 1}
        </label>
        {totalChoices > 2 && (
          <button
            type="button"
            onClick={onRemove}
            className="
              text-sm text-red-600
              hover:text-red-800
              font-medium
            "
          >
            削除
          </button>
        )}
      </div>

      {/* 選択肢テキスト */}
      <div>
        <input
          type="text"
          value={choice.text}
          onChange={(e) => onUpdateField("text", e.target.value)}
          placeholder="例: 東京"
          maxLength={200}
          className="
            w-full rounded-md border border-gray-300
            bg-white px-3 py-2
            text-sm text-gray-900 placeholder-gray-500
            focus:border-blue-500 focus:outline-none
            focus:ring-1 focus:ring-blue-500
          "
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{choice.text.length}/200文字</span>
        </div>
      </div>

      {/* 選択肢画像 */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">
          選択肢画像 （任意）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onUploadImage}
            className="
              flex-1 rounded-md border border-gray-300
              bg-white px-3 py-2
              text-xs text-gray-900
            "
          />
          {choice.imageUrl && <span className="text-xs text-green-600">✓</span>}
        </div>
      </div>

      {/* 正解チェックボックス */}
      <div className="flex items-center gap-2">
        <input
          type="radio"
          id={`correct-${index}`}
          name="correct_choice"
          checked={choice.isCorrect}
          onChange={() => onCorrectChange(true)}
          className="rounded"
        />
        <label
          htmlFor={`correct-${index}`}
          className="text-sm text-gray-700 cursor-pointer"
        >
          この選択肢が正解
        </label>
      </div>

      {/* 正解発表用テキスト */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">
          正解発表用テキスト （任意）
        </label>
        <input
          type="text"
          value={choice.answerText || ''}
          onChange={(e) => onUpdateField("answerText", e.target.value)}
          maxLength={200}
          className="
            w-full rounded-md border border-gray-300
            bg-white px-3 py-2
            text-sm text-gray-900
            focus:border-blue-500 focus:outline-none
            focus:ring-1 focus:ring-blue-500
          "
        />
        <div className="mt-1 text-xs text-gray-500">
          モニター画面の正解発表時に表示されます。空欄の場合は選択肢のテキストが使用されます。
        </div>
      </div>
    </div>
  );
}
