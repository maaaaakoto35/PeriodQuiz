"use client";

import {
  MonitorWaiting,
  MonitorQuestionReading,
  MonitorQuestion,
  MonitorAnswerCheck,
  MonitorBreak,
  MonitorPeriodResult,
  MonitorFinalResult,
  MonitorBGM,
} from "./";
import { useQuizScreenContext } from "../_context/QuizScreenContext";
import styles from "./MonitorSection.module.css";

/**
 * モニター画面セクション（Client Component）
 *
 * 責務:
 * - QuizScreenContext から currentScreen を取得
 * - 画面状態に応じて子コンポーネントを切り替え表示
 * - BGM再生制御
 */
export function MonitorSection() {
  const { eventId, currentScreen } = useQuizScreenContext();

  // 画面の選択と表示
  const renderScreen = () => {
    switch (currentScreen) {
      case "waiting":
        return <MonitorWaiting />;
      case "question_reading":
        return <MonitorQuestionReading />;
      case "question":
        return <MonitorQuestion isAnswer={false} />;
      case "answer_check":
        return <MonitorAnswerCheck />;
      case "answer":
        return <MonitorQuestion isAnswer={true} />;
      case "break":
        return <MonitorBreak />;
      case "period_result":
        return <MonitorPeriodResult />;
      case "final_result":
        return <MonitorFinalResult />;
      default:
        return <div>Unknown screen: {currentScreen}</div>;
    }
  };

  return (
    <div className={styles.root}>
      {/* BGM制御 */}
      <MonitorBGM eventId={eventId} />

      {/* コンテンツ */}
      {renderScreen()}
    </div>
  );
}
