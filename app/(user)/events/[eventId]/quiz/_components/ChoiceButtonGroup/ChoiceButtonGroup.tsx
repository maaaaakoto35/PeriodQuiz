import { ChoiceButton } from "../ChoiceButton";
import styles from "./ChoiceButtonGroup.module.css";

export interface Choice {
  id: number;
  text: string;
  imageUrl: string | null;
  orderNum: number;
  isCorrect?: boolean;
  selectionCount?: number; // answer画面：この選択肢を選んだ人数
}

interface ChoiceButtonGroupProps {
  choices: Choice[];
  selectedChoiceId: number | null;
  isAnswered: boolean;
  onSelectChoice: (choiceId: number) => void;
  // answer画面用（オプション）
  showCorrectness?: boolean;
  userSelectedChoiceId?: number | null;
  isShowImageUrl: boolean;
  showSelectionCount?: boolean; // answer_check画面：正解を表示せず回答数のみ表示
}

/**
 * 選択肢ボタンのグループ
 * 複数の ChoiceButton を管理し、レイアウトを処理
 *
 * answer画面では正解/不正解を表示可能
 */
export function ChoiceButtonGroup({
  choices,
  selectedChoiceId,
  isAnswered,
  onSelectChoice,
  showCorrectness = false,
  userSelectedChoiceId,
  isShowImageUrl,
  showSelectionCount = false,
}: ChoiceButtonGroupProps) {
  return (
    <div className={styles.container}>
      {choices
        .sort((a, b) => a.orderNum - b.orderNum)
        .map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            id={choice.id}
            text={choice.text}
            imageUrl={isShowImageUrl ? choice.imageUrl : null}
            buttonNumber={index + 1}
            isSelected={
              showCorrectness || showSelectionCount
                ? userSelectedChoiceId === choice.id
                : selectedChoiceId === choice.id
            }
            isDisabled={isAnswered}
            onSelect={onSelectChoice}
            // answer画面用
            isCorrect={showCorrectness ? choice.isCorrect : undefined}
            userSelected={
              showCorrectness || showSelectionCount ? userSelectedChoiceId === choice.id : undefined
            }
            showCorrectness={showCorrectness}
            selectionCount={showCorrectness || showSelectionCount ? choice.selectionCount : undefined}
            showSelectionCount={showSelectionCount}
          />
        ))}
    </div>
  );
}
