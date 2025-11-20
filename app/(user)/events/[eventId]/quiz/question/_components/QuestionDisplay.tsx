"use client";

import { useQuestionAnswer } from "../_hooks/useQuestionAnswer";
import { QuestionContent } from "./QuestionContent";
import { ChoiceButtonGroup, Choice } from "./ChoiceButtonGroup";
import { useSessionContext } from "../../_context/SessionContext";

interface QuestionDisplayProps {
  eventId: number;
  questionText: string;
  questionImageUrl: string | null;
  choices: Choice[];
}

/**
 * クイズ問題表示のメインコンポーネント
 * - 問題テキスト・画像の表示
 * - 選択肢の表示と選択管理
 * - 回答の送信と状態管理
 */
export function QuestionDisplay({
  eventId,
  questionText,
  questionImageUrl,
  choices,
}: QuestionDisplayProps) {
  const { eventName } = useSessionContext();
  const {
    selectedChoiceId,
    isSubmitting,
    isAnswered,
    error,
    selectChoice,
    submit,
  } = useQuestionAnswer();

  const handleSubmit = async () => {
    await submit(eventId);
  };

  return (
    <div
      className="
      flex flex-col items-center justify-center
      w-full h-screen
      p-4
      bg-cover bg-center bg-no-repeat
    "
      style={{
        backgroundImage: "url('/quiz_background.jpeg')",
      }}
    >
      {/* イベント名 */}
      <div className="mb-4">
        <h1
          className="
          text-2xl font-bold text-white
          drop-shadow-lg
        "
        >
          {eventName}
        </h1>
      </div>

      {/* メインコンテンツエリア */}
      <div
        className="
        flex flex-col items-center justify-center
        w-full max-w-lg
        bg-white rounded-2xl
        shadow-2xl overflow-hidden
        backdrop-blur-sm
      "
      >
        {/* 問題内容 */}
        <div className="w-full p-6 space-y-4">
          <QuestionContent text={questionText} imageUrl={questionImageUrl} />
        </div>

        {/* 選択肢グループ */}
        <div className="w-full p-6 bg-gray-50">
          <ChoiceButtonGroup
            choices={choices}
            selectedChoiceId={selectedChoiceId}
            isAnswered={isAnswered}
            onSelectChoice={selectChoice}
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div
            className="
            w-full p-3 px-6
            bg-red-50 border-t border-red-200
            text-sm text-red-700
          "
          >
            {error}
          </div>
        )}

        {/* 送信ボタン */}
        {!isAnswered && (
          <div className="w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t">
            <button
              onClick={handleSubmit}
              disabled={!selectedChoiceId || isSubmitting}
              className={`
                w-full py-4 px-6
                rounded-xl font-bold text-lg
                transition-all duration-200 shadow-md
                ${
                  selectedChoiceId && !isSubmitting
                    ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? "送信中..." : "回答する"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
