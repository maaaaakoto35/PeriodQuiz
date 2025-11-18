"use client";

import type { ChoiceInput } from "@/app/_lib/actions/admin/quizzes";

interface ChoiceFieldArrayProps {
  choices: ChoiceInput[];
  errors: Record<string, string>;
  onUpdateChoice: (index: number, field: keyof ChoiceInput, value: any) => void;
  onAddChoice: () => void;
  onRemoveChoice: (index: number) => void;
  onUploadImage: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function ChoiceFieldArray({
  choices,
  errors,
  onUpdateChoice,
  onAddChoice,
  onRemoveChoice,
  onUploadImage,
}: ChoiceFieldArrayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        選択肢 <span className="text-red-600">*</span>
      </h3>

      <div className="space-y-4">
        {choices.map((choice, index) => (
          <div
            key={index}
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
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => onRemoveChoice(index)}
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
                onChange={(e) => onUpdateChoice(index, "text", e.target.value)}
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
                  onChange={(e) => onUploadImage(index, e)}
                  className="
                    flex-1 rounded-md border border-gray-300
                    bg-white px-3 py-2
                    text-xs text-gray-900
                  "
                />
                {choice.imageUrl && (
                  <span className="text-xs text-green-600">✓</span>
                )}
              </div>
            </div>

            {/* 正解チェックボックス */}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`correct-${index}`}
                name="correct_choice"
                checked={choice.isCorrect}
                onChange={() => {
                  // 他の選択肢の isCorrect をすべて false に
                  choices.forEach((_, i) => {
                    if (i !== index) {
                      onUpdateChoice(i, "isCorrect", false);
                    }
                  });
                  onUpdateChoice(index, "isCorrect", true);
                }}
                className="rounded"
              />
              <label
                htmlFor={`correct-${index}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                この選択肢が正解
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* 選択肢追加ボタン */}
      {choices.length < 4 && (
        <button
          type="button"
          onClick={onAddChoice}
          className="
            w-full rounded-md border-2 border-dashed
            border-gray-300 py-2
            text-sm text-gray-600
            hover:border-blue-500 hover:text-blue-600
            transition-colors
          "
        >
          + 選択肢を追加
        </button>
      )}
    </div>
  );
}
