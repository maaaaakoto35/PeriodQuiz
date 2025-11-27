"use client";

import { useEffect, useState } from "react";
import { getQuestionForMonitor } from "@/app/_lib/actions/admin";

interface MonitorQuestionProps {
  eventId: number;
}

interface Question {
  id: number;
  text: string;
  image_url: string | null;
}

interface Choice {
  id: number;
  text: string;
  image_url: string | null;
  order_num: number;
}

/**
 * モニター画面 - 問題表示
 *
 * 現在の問題と選択肢を表示（回答ボタンなし）
 */
export function MonitorQuestion({ eventId }: MonitorQuestionProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestion = async () => {
      try {
        const result = await getQuestionForMonitor(eventId);

        if (!isMounted) return;

        if (result.success) {
          setQuestion({
            id: result.data.id,
            text: result.data.text,
            image_url: result.data.image_url,
          });
          setChoices(result.data.choices);
          setLoading(false);
        } else {
          setError(result.error);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[MonitorQuestion] Error:", err);
          setError("予期しないエラーが発生しました");
          setLoading(false);
        }
      }
    };

    fetchQuestion();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
          <p className="mt-4 text-gray-600">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error || "問題の読み込みに失敗しました"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 問題画像 */}
      {question.image_url && (
        <div className="mb-8 text-center">
          <img
            src={question.image_url}
            alt="Question"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* 問題テキスト */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900">{question.text}</h2>
      </div>

      {/* 選択肢 */}
      <div className="space-y-4">
        {choices.map((choice, index) => (
          <div
            key={choice.id}
            className="p-6 bg-white rounded-lg shadow-md border-2 border-gray-200"
          >
            {/* 選択肢画像 */}
            {choice.image_url && (
              <div className="mb-4 text-center">
                <img
                  src={choice.image_url}
                  alt={`Choice ${index + 1}`}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* 選択肢テキスト */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mr-4 flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </div>
              <p className="text-lg text-gray-900">{choice.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
