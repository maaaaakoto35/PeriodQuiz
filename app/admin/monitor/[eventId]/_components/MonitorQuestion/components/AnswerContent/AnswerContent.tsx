import { AnswerChoiceCard } from "../AnswerChoiceCard/AnswerChoiceCard";
import type { MonitorAnswerData } from "@/app/_lib/actions/admin";

import styles from "./AnswerContent.module.css";

interface AnswerContentProps {
  data: MonitorAnswerData;
  isAnswer?: boolean;
  correctChoiceId?: number;
  showSelectionCount?: boolean;
}

/**
 * モニター画面 - 正解発表コンテンツ（問題画像と選択肢）
 */
export function AnswerContent({
  data,
  isAnswer,
  correctChoiceId,
  showSelectionCount,
}: AnswerContentProps) {
  return (
    <div className={styles.root}>
      {/* 問題画像 */}
      {data.questionImageUrl && (
        <img
          className="self-stretch h-80 object-contain"
          src={data.questionImageUrl}
          alt="Question"
        />
      )}

      {/* 選択肢 - 2行2列グリッド */}
      <div className={styles.choices}>
        {/* 第1行 */}
        <div className={styles.row}>
          {data.choices.slice(0, 2).map((choice, index) => (
            <AnswerChoiceCard
              key={choice.id}
              choiceIndex={index}
              choiceText={choice.text}
              choiceImageUrl={data.questionImageUrl ? null : choice.imageUrl}
              selectionCount={(showSelectionCount ?? !!isAnswer) ? choice.selectionCount || 0 : null}
              isCorrect={!!isAnswer && choice.id === correctChoiceId}
              rowIndex={0}
              answerText={isAnswer ? choice.answerText : null}
            />
          ))}
        </div>

        {/* 第2行 */}
        <div className={styles.row}>
          {data.choices.slice(2, 4).map((choice, index) => (
            <AnswerChoiceCard
              key={choice.id}
              choiceIndex={index + 2}
              choiceText={choice.text}
              choiceImageUrl={data.questionImageUrl ? null : choice.imageUrl}
              selectionCount={(showSelectionCount ?? !!isAnswer) ? choice.selectionCount || 0 : null}
              isCorrect={!!isAnswer && choice.id === correctChoiceId}
              rowIndex={1}
              answerText={isAnswer ? choice.answerText : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
