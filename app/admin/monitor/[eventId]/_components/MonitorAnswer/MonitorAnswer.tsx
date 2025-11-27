"use client";

import { useEffect, useState } from "react";
import { getAnswerForMonitor } from "@/app/_lib/actions/admin";
import type { MonitorAnswerData } from "@/app/_lib/actions/admin";

interface MonitorAnswerProps {
  eventId: number;
}

/**
 * モニター画面 - 正解発表
 *
 * 正解を表示
 */
export function MonitorAnswer({ eventId }: MonitorAnswerProps) {
  const [data, setData] = useState<MonitorAnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      const result = await getAnswerForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
          <p className="mt-4 text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            {error || "結果の読み込みに失敗しました"}
          </p>
        </div>
      </div>
    );
  }

  const correctChoice = data.choices.find((c) => c.isCorrect);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 正解バッジ */}
      <div className="mb-8 text-center">
        <div className="inline-block px-6 py-3 bg-green-100 rounded-lg border-2 border-green-500">
          <p className="text-lg font-bold text-green-700">✓ 正解発表</p>
        </div>
      </div>

      {/* 問題テキスト */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {data.questionText}
        </h2>
      </div>

      {/* 問題画像 */}
      {data.questionImageUrl && (
        <div className="mb-8 text-center">
          <img
            src={data.questionImageUrl}
            alt="Question"
            className="max-w-full h-auto rounded-lg shadow"
          />
        </div>
      )}

      {/* 選択肢 */}
      <div className="space-y-4">
        {data.choices.map((choice, index) => {
          const isCorrect = choice.id === correctChoice?.id;
          return (
            <div
              key={choice.id}
              className={`p-6 rounded-lg shadow-md border-2 transition-colors ${
                isCorrect
                  ? "bg-green-50 border-green-500"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* 選択肢画像 */}
              {choice.imageUrl && (
                <div className="mb-4 text-center">
                  <img
                    src={choice.imageUrl}
                    alt={`Choice ${index + 1}`}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {/* 選択肢テキスト */}
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-4 flex-shrink-0 ${
                    isCorrect
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <p className="text-lg text-gray-900">{choice.text}</p>
                {isCorrect && (
                  <div className="ml-auto px-4 py-2 bg-green-100 rounded-lg border border-green-500">
                    <p className="text-sm font-bold text-green-700">正解</p>
                  </div>
                )}
              </div>

              {/* 選択人数 */}
              {choice.selectionCount && choice.selectionCount > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  選択人数: {choice.selectionCount}名
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
