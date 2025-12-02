"use client";

import type { QuizScreen } from "@/app/_lib/types/quiz";
import {
  MonitorWaiting,
  MonitorQuestion,
  MonitorBreak,
  MonitorPeriodResult,
  MonitorFinalResult,
} from "./";
import { useQuizScreenMonitoring } from "../_hooks/useQuizScreenMonitoring";
import styles from "./MonitorSection.module.css";

interface MonitorSectionProps {
  eventId: number;
  initialScreen: QuizScreen;
}

/**
 * モニター画面セクション（Client Component）
 *
 * 責務:
 * - Supabase Realtime で quiz_control を監視
 * - current_screen 変更を検知して画面遷移
 * - 状態管理: currentScreen のみ
 */
export function MonitorSection({
  eventId,
  initialScreen,
}: MonitorSectionProps) {
  const currentScreen = useQuizScreenMonitoring(eventId, initialScreen);

  // 画面の選択と表示
  const renderScreen = () => {
    switch (currentScreen) {
      case "waiting":
        return <MonitorWaiting />;
      case "question":
        return (
          <MonitorQuestion eventId={eventId} currentScreen={currentScreen} />
        );
      case "answer":
        return (
          <MonitorQuestion
            eventId={eventId}
            currentScreen={currentScreen}
            isAnswer
          />
        );
      case "break":
        return <MonitorBreak eventId={eventId} />;
      case "period_result":
        return <MonitorPeriodResult eventId={eventId} />;
      case "final_result":
        return <MonitorFinalResult eventId={eventId} />;
      default:
        return <div>Unknown screen: {currentScreen}</div>;
    }
  };

  return (
    <div className={styles.root}>
      {/* コンテンツ */}
      {renderScreen()}
    </div>
  );
}
