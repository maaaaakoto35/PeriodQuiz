"use client";

import {
  QuestionContent,
  ChoiceButtonGroup,
  type Choice,
} from "../../../_components";
import styles from "./AnswerDisplay.module.css";

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
    <div className={styles.container}>
      {/* 問題内容 */}
      <div className={styles.questionSection}>
        <QuestionContent text={questionText} imageUrl={questionImageUrl} />
      </div>

      {/* 選択肢グループ */}
      <div className={styles.choiceSection}>
        <ChoiceButtonGroup
          choices={choices}
          selectedChoiceId={null}
          isAnswered={true}
          onSelectChoice={() => {}} // answer画面では選択不可
          showCorrectness={true}
          userSelectedChoiceId={userAnswer?.choiceId ?? null}
          isShowImageUrl={!questionImageUrl}
        />
      </div>

      {/* 回答結果セクション */}
      <div className={styles.resultSection}>
        {userAnswer ? (
          <>
            {/* 正解/不正解 */}
            <div className={styles.resultRow}>
              <div
                className={
                  userAnswer.isCorrect
                    ? styles.resultMarkCorrect
                    : styles.resultMarkIncorrect
                }
              >
                {userAnswer.isCorrect ? "✓" : "✗"}
              </div>
              <p
                className={
                  userAnswer.isCorrect
                    ? styles.resultTextCorrect
                    : styles.resultTextIncorrect
                }
              >
                {userAnswer.isCorrect ? "正解！" : "不正解"}
              </p>
            </div>

            {/* 回答時間 */}
            <div className={styles.timeDisplay}>
              <span className={styles.timeLabel}>⏱ 回答時間:</span>
              <span className={styles.timeValue}>
                {(userAnswer.responseTimeMs / 1000).toFixed(3)}秒
              </span>
            </div>

            {/* 正解の表示（不正解の場合） */}
            {!userAnswer.isCorrect && correctChoice && (
              <div className={styles.correctAnswerBox}>
                <p className={styles.correctAnswerLabel}>正解は:</p>
                <p className={styles.correctAnswerText}>{correctChoice.text}</p>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noAnswerDisplay}>
            <span className={styles.noAnswerLabel}>⚠ 未回答</span>
          </div>
        )}
      </div>
    </div>
  );
}
