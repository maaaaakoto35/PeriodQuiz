"use client";

import type { QuizScreen } from "@/app/_lib/types/quiz";
import {
  MonitorWaiting,
  MonitorQuestion,
  MonitorAnswer,
  MonitorBreak,
  MonitorPeriodResult,
  MonitorFinalResult,
} from "./";
import { useQuizScreenMonitoring } from "../_hooks/useQuizScreenMonitoring";

interface MonitorSectionProps {
  eventId: number;
  eventName: string;
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
  eventName,
  initialScreen,
}: MonitorSectionProps) {
  const currentScreen = useQuizScreenMonitoring(eventId, initialScreen);

  // 画面の選択と表示
  const renderScreen = () => {
    switch (currentScreen) {
      case "waiting":
        return <MonitorWaiting />;
      case "question":
        return <MonitorQuestion eventId={eventId} />;
      case "answer":
        return <MonitorAnswer eventId={eventId} />;
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
    <div className="min-h-screen w-full bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{eventName}</h1>
              <p className="mt-1 text-sm text-gray-500">モニター画面</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                画面:{" "}
                <span className="font-semibold text-blue-600">
                  {currentScreen}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderScreen()}
      </div>
    </div>
  );
}
