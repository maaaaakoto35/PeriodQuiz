import { ChoiceButton } from "./ChoiceButton";

export interface Choice {
  id: number;
  text: string;
  imageUrl: string | null;
  orderNum: number;
  isCorrect?: boolean;
}

interface ChoiceButtonGroupProps {
  choices: Choice[];
  selectedChoiceId: number | null;
  isAnswered: boolean;
  onSelectChoice: (choiceId: number) => void;
  // answer画面用（オプション）
  showCorrectness?: boolean;
  userSelectedChoiceId?: number | null;
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
}: ChoiceButtonGroupProps) {
  return (
    <div className="w-full grid grid-cols-2 gap-4">
      {choices
        .sort((a, b) => a.orderNum - b.orderNum)
        .map((choice) => (
          <ChoiceButton
            key={choice.id}
            id={choice.id}
            text={choice.text}
            imageUrl={choice.imageUrl}
            isSelected={
              showCorrectness
                ? userSelectedChoiceId === choice.id
                : selectedChoiceId === choice.id
            }
            isDisabled={isAnswered}
            onSelect={onSelectChoice}
            // answer画面用
            isCorrect={showCorrectness ? choice.isCorrect : undefined}
            userSelected={
              showCorrectness ? userSelectedChoiceId === choice.id : undefined
            }
            showCorrectness={showCorrectness}
          />
        ))}
    </div>
  );
}
