"use client";

import { useEffect, useState } from "react";
import { getAnswerForMonitor } from "@/app/_lib/actions/admin";
import { QuizScreen } from "@/app/_lib/types/quiz";
import type { MonitorAnswerData } from "@/app/_lib/actions/admin";
import { createClient } from "@/app/_lib/supabase/client";
import {
  MonitorAnswerHeader,
  AnswerContent,
  QuestionPanel,
} from "./components";

import styles from "./MonitorAnswer.module.css";

interface MonitorAnswerProps {
  eventId: number;
  currentScreen: QuizScreen;
  isAnswer?: boolean;
}

interface EventInfo {
  eventName: string;
  periodName: string;
  questionNumber: number;
}

/**
 * モニター画面 - 正解発表
 *
 * 正解を表示
 */
export function MonitorQuestion({
  eventId,
  currentScreen,
  isAnswer,
}: MonitorAnswerProps) {
  const [data, setData] = useState<MonitorAnswerData | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      // イベント情報とピリオド情報を取得
      const supabase = await createClient();

      const { data: quizControl } = await supabase
        .from("quiz_control")
        .select("current_period_id, current_question_id")
        .eq("event_id", eventId)
        .single();

      if (quizControl?.current_period_id) {
        const { data: period } = await supabase
          .from("periods")
          .select("name, order_num")
          .eq("id", quizControl.current_period_id)
          .single();

        const { data: event } = await supabase
          .from("events")
          .select("name")
          .eq("id", eventId)
          .single();

        const { count } = await supabase
          .from("question_displays")
          .select("id, periods!inner(event_id)", { count: "exact" })
          .eq("periods.event_id", eventId);

        if (isMounted && period && event) {
          setEventInfo({
            eventName: event.name,
            periodName: period.name,
            questionNumber: count || 0,
          });
        }
      }

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

  if (error || !data || !eventInfo) {
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
      <MonitorAnswerHeader
        eventName={eventInfo.eventName}
        periodName={eventInfo.periodName}
      />

      {/* コンテンツエリア */}
      <div className={styles.main}>
        {/* 左側: 問題画像と選択肢 */}
        <AnswerContent
          data={data}
          correctChoiceId={correctChoice?.id}
          isAnswer={isAnswer}
        />

        {/* 右側: 問題パネル */}
        <QuestionPanel
          questionText={data.questionText}
          questionNumber={eventInfo.questionNumber}
        />
      </div>
    </div>
  );
}
