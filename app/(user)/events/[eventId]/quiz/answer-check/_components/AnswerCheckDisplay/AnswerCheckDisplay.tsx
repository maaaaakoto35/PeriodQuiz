"use client";

import {
  QuestionContent,
  ChoiceButtonGroup,
  type Choice,
} from "../../../_components";
import styles from "./AnswerCheckDisplay.module.css";

interface AnswerCheckDisplayProps {
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
 * アンサーチェック画面表示コンポーネント
 * - 問題内容の表示
 * - 各選択肢の回答数を表示
 * - 正解は表示しない
 * - ユーザーが選んだ選択肢をハイライト
 */
export function AnswerCheckDisplay({
  questionText,
  questionImageUrl,
  choices,
  userAnswer,
}: AnswerCheckDisplayProps) {
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
          onSelectChoice={() => {}} // answer_check画面では選択不可
          showCorrectness={false}
          userSelectedChoiceId={userAnswer?.choiceId ?? null}
          isShowImageUrl={!questionImageUrl}
          showSelectionCount={true}
        />
      </div>

      {/* アンサーチェック説明セクション */}
      <div className={styles.infoSection}>
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            各選択肢の回答数を表示しています
          </p>
          <p className={styles.infoSubText}>
            正解発表をお待ちください
          </p>
        </div>
      </div>
    </div>
  );
}
