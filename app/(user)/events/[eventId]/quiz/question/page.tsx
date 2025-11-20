"use client";

import { useEffect, useState } from "react";
import {
  getQuestionWithChoices,
  GetQuestionWithChoicesResult,
} from "@/app/_lib/actions/user";
import { getQuizStatus } from "@/app/_lib/actions/user";
import { QuestionDisplay } from "../_components/QuestionDisplay";
import { useSessionContext } from "../_context/SessionContext";

/**
 * クイズ問題表示ページ
 * - 現在の問題と選択肢を取得
 * - QuestionDisplay コンポーネントに渡す
 */
export default function QuestionPage() {
  const { eventId } = useSessionContext();

  const [question, setQuestion] = useState<GetQuestionWithChoicesResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoading(true);
      setError(null);

      // クイズの状態を取得
      const statusResult = await getQuizStatus(eventId);
      if (!statusResult.success) {
        setError("クイズ状態の取得に失敗しました");
        setIsLoading(false);
        return;
      }

      // 問題と選択肢を取得
      const result = await getQuestionWithChoices({ eventId });

      if (!result.success) {
        setError(result.error);
      } else {
        setQuestion(result);
      }

      setIsLoading(false);
    };

    fetchQuestion();
  }, [eventId]);

  if (isLoading) {
    return (
      <div
        className="
        flex items-center justify-center
        w-full h-screen
        bg-gray-50
      "
      >
        <p className="text-gray-600">問題を読み込み中...</p>
      </div>
    );
  }

  if (error || !question || !question.success) {
    return (
      <div
        className="
        flex flex-col items-center justify-center
        w-full h-screen
        bg-gray-50
        space-y-4
      "
      >
        <p className="text-lg font-semibold text-red-600">エラー</p>
        <p className="text-gray-600">
          {error || "問題の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const { data } = question;

  return (
    <div
      className="
      flex items-center justify-center
      w-full min-h-screen
      bg-gray-50 p-4
    "
    >
      <QuestionDisplay
        eventId={eventId}
        questionText={data.text}
        questionImageUrl={data.image_url}
        choices={data.choices.map(
          (choice: {
            id: number;
            text: string;
            image_url: string | null;
            order_num: number;
          }) => ({
            id: choice.id,
            text: choice.text,
            imageUrl: choice.image_url,
            orderNum: choice.order_num,
          })
        )}
      />
    </div>
  );
}
