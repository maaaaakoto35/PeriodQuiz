"use client";

import { useQuestionAnswer } from "../../_hooks/useQuestionAnswer";
import { EventNameHeader } from "../../../_components/EventNameHeader";
import { QuestionContent } from "../../../_components/QuestionContent";
import {
  ChoiceButtonGroup,
  type Choice,
} from "../../../_components/ChoiceButtonGroup";
import styles from "./QuestionDisplay.module.css";

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
    <div className={styles.wrapper}>
      {/* メインコンテンツエリア */}
      <div className={styles.contentCard}>
        {/* 問題内容 */}
        <div className={styles.questionSection}>
          <QuestionContent text={questionText} imageUrl={questionImageUrl} />
        </div>

        {/* 選択肢グループ */}
        <div className={styles.choicesSection}>
          <ChoiceButtonGroup
            choices={choices}
            selectedChoiceId={selectedChoiceId}
            isAnswered={isAnswered}
            onSelectChoice={selectChoice}
            isShowImageUrl={!questionImageUrl}
          />
        </div>

        {/* エラー表示 */}
        {error && <div className={styles.errorSection}>{error}</div>}

        {/* 送信ボタン */}
        {!isAnswered && (
          <div className={styles.submitSection}>
            <button
              onClick={handleSubmit}
              disabled={!selectedChoiceId || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "送信中..." : "回答する"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
