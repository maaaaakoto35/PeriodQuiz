"use client";

import {
  EventNameHeader,
  QuestionContent,
  ChoiceButtonGroup,
  type Choice,
} from "../../_components";

interface AnswerDisplayProps {
  questionText: string;
  questionImageUrl: string | null;
  choices: Choice[];
  userAnswer: {
    choiceId: number;
    isCorrect: boolean;
    responseTimeMs: number;
  } | null;
}

/**
 * 回答画面表示コンポーネント
 * - 問題内容の表示
 * - ユーザーの回答と正解の表示
 * - 回答時間の表示
 */
export function AnswerDisplay({
  questionText,
  questionImageUrl,
  choices,
  userAnswer,
}: AnswerDisplayProps) {
  const correctChoice = choices.find((c) => c.isCorrect);

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
      <EventNameHeader />

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
            selectedChoiceId={null}
            isAnswered={true}
            onSelectChoice={() => {}} // answer画面では選択不可
            showCorrectness={true}
            userSelectedChoiceId={userAnswer?.choiceId ?? null}
          />
        </div>

        {/* 回答結果セクション */}
        <div
          className="
          w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50
          border-t border-blue-200
          space-y-3
        "
        >
          {userAnswer ? (
            <>
              {/* 正解/不正解 */}
              <div className="flex items-center gap-2">
                <div
                  className={`
                  w-8 h-8 rounded-full
                  flex items-center justify-center
                  font-bold text-white text-lg
                  ${userAnswer.isCorrect ? "bg-green-500" : "bg-red-500"}
                `}
                >
                  {userAnswer.isCorrect ? "✓" : "✗"}
                </div>
                <p
                  className={`
                  text-lg font-bold
                  ${userAnswer.isCorrect ? "text-green-600" : "text-red-600"}
                `}
                >
                  {userAnswer.isCorrect ? "正解！" : "不正解"}
                </p>
              </div>

              {/* 回答時間 */}
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-sm font-semibold">⏱ 回答時間:</span>
                <span className="text-sm">
                  {(userAnswer.responseTimeMs / 1000).toFixed(3)}秒
                </span>
              </div>

              {/* 正解の表示（不正解の場合） */}
              {!userAnswer.isCorrect && correctChoice && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    正解は:
                  </p>
                  <p className="text-sm font-bold text-green-800">
                    {correctChoice.text}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-sm font-semibold">⚠ 未回答</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
