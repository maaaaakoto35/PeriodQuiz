import { ChoiceButton } from "./ChoiceButton";

export interface Choice {
  id: number;
  text: string;
  imageUrl: string | null;
  orderNum: number;
}

interface ChoiceButtonGroupProps {
  choices: Choice[];
  selectedChoiceId: number | null;
  isAnswered: boolean;
  onSelectChoice: (choiceId: number) => void;
}

/**
 * 選択肢ボタンのグループ
 * 複数の ChoiceButton を管理し、レイアウトを処理
 */
export function ChoiceButtonGroup({
  choices,
  selectedChoiceId,
  isAnswered,
  onSelectChoice,
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
            isSelected={selectedChoiceId === choice.id}
            isDisabled={isAnswered}
            onSelect={onSelectChoice}
          />
        ))}
    </div>
  );
}
