"use client";

import { ChoiceField } from "./components/ChoiceField";
import type { ChoiceInput } from "@/app/_lib/actions/admin/quizzes";

interface ChoiceFieldArrayProps {
  choices: ChoiceInput[];
  onUpdateChoice: (
    index: number,
    field: keyof ChoiceInput,
    value: string | boolean
  ) => void;
  onAddChoice: () => void;
  onRemoveChoice: (index: number) => void;
  onUploadImage: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function ChoiceFieldArray({
  choices,
  onUpdateChoice,
  onAddChoice,
  onRemoveChoice,
  onUploadImage,
}: ChoiceFieldArrayProps) {
  const handleCorrectChange = (index: number, isCorrect: boolean) => {
    // 他の選択肢の isCorrect をすべて false に
    if (isCorrect) {
      choices.forEach((_, i) => {
        if (i !== index) {
          onUpdateChoice(i, "isCorrect", false);
        }
      });
    }
    onUpdateChoice(index, "isCorrect", isCorrect);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        選択肢 <span className="text-red-600">*</span>
      </h3>

      <div className="space-y-4">
        {choices.map((choice, index) => (
          <ChoiceField
            key={index}
            choice={choice}
            index={index}
            totalChoices={choices.length}
            onUpdateField={(field, value) =>
              onUpdateChoice(index, field, value)
            }
            onRemove={() => onRemoveChoice(index)}
            onUploadImage={(e) => onUploadImage(index, e)}
            onCorrectChange={(isCorrect) =>
              handleCorrectChange(index, isCorrect)
            }
          />
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
