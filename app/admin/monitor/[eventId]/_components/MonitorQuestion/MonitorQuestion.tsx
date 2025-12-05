"use client";

import { useEffect, useState } from "react";
import { getAnswerForMonitor } from "@/app/_lib/actions/admin";
import type { MonitorAnswerData } from "@/app/_lib/actions/admin";
import { AnswerContent, QuestionPanel } from "./components";
import { MonitorHeader } from "@/app/admin/monitor/[eventId]/_components/MonitorHeader";
import { useQuizScreenContext } from "@/app/admin/monitor/[eventId]/_context/QuizScreenContext";

import styles from "./MonitorAnswer.module.css";

interface MonitorAnswerProps {
  isAnswer?: boolean;
}

/**
 * モニター画面 - 正解発表
 *
 * 正解を表示
 */
export function MonitorQuestion({ isAnswer }: MonitorAnswerProps) {
  const { eventId, currentScreen } = useQuizScreenContext();
  const [data, setData] = useState<MonitorAnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      // 正解情報を取得
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
  }, [eventId, currentScreen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
          <p className="mt-4 text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className={styles.root}>
      {/* ヘッダー */}
      <MonitorHeader />

      {/* コンテンツエリア */}
      <div className={styles.main}>
        {/* 左側: 問題画像と選択肢 */}
        <AnswerContent
          data={data}
          correctChoiceId={correctChoice?.id}
          isAnswer={isAnswer}
        />

        {/* 右側: 問題パネル */}
        <QuestionPanel questionText={data.questionText} />
      </div>
    </div>
  );
}
