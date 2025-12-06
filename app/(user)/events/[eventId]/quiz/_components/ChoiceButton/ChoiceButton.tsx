import Image from "next/image";
import styles from "./ChoiceButton.module.css";

interface ChoiceButtonProps {
  id: number;
  text: string;
  imageUrl: string | null;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (choiceId: number) => void;
  buttonNumber: number; // マップ内のindex（1-4）
  // answer画面用（オプション）
  isCorrect?: boolean;
  userSelected?: boolean;
  showCorrectness?: boolean;
  selectionCount?: number; // answer画面：この選択肢を選んだ人数
  showSelectionCount?: boolean; // answer_check画面：正解を表示せず回答数のみ表示
}

/**
 * 個別の選択肢ボタン
 * テキスト＋画像を表示し、選択/非選択状態を管理
 *
 * answer画面では正解/不正解を表示可能
 */
export function ChoiceButton({
  id,
  text,
  imageUrl,
  isSelected,
  isDisabled,
  onSelect,
  buttonNumber,
  isCorrect,
  userSelected,
  showCorrectness,
  selectionCount,
  showSelectionCount,
}: ChoiceButtonProps) {
  // ボタンのスタイルを決定
  let buttonClass = styles.button;

  // answer画面で正解/不正解を表示する場合
  if (showCorrectness) {
    if (userSelected && isCorrect) {
      // ユーザーが選択した選択肢が正解
      buttonClass += ` ${styles.buttonCorrectSelected}`;
    } else if (userSelected && !isCorrect) {
      // ユーザーが選択した選択肢が不正解
      buttonClass += ` ${styles.buttonIncorrectSelected}`;
    } else if (isCorrect && !userSelected) {
      // ユーザーが選択していない正解
      buttonClass += ` ${styles.buttonCorrectNotSelected}`;
    } else {
      // その他
      buttonClass += ` ${styles.buttonNotSelected}`;
    }
  } else {
    // 通常のクイズ画面
    if (isSelected) {
      buttonClass += ` ${styles.buttonSelected}`;
    } else {
      buttonClass += ` ${styles.buttonNotSelected}`;
    }
  }

  // 番号バッジのクラスを決定
  const numberBadgeClass = [
    styles.numberBadge,
    buttonNumber === 1
      ? styles.numberBadge1
      : buttonNumber === 2
      ? styles.numberBadge2
      : buttonNumber === 3
      ? styles.numberBadge3
      : styles.numberBadge4,
  ].join(" ");

  return (
    <button
      onClick={() => onSelect(id)}
      disabled={isDisabled}
      className={buttonClass}
    >
      {/* ボタン番号バッジ */}
      <div className={numberBadgeClass}>{buttonNumber}</div>

      {/* 正解バッジ（answer画面用） */}
      {showCorrectness && isCorrect && !userSelected && (
        <div className={styles.correctBadgeIcon}>✓</div>
      )}

      {/* 正解/不正解ラベル（answer画面用） */}
      {showCorrectness && userSelected && isCorrect && (
        <div className={styles.correctBadgeText}>正解</div>
      )}

      {showCorrectness && userSelected && !isCorrect && (
        <div className={styles.incorrectBadgeText}>不正解</div>
      )}

      {/* 選択数表示（answer/answer_check画面用） */}
      {(showCorrectness || showSelectionCount) && selectionCount !== undefined && (
        <div className={styles.selectionCount}>{selectionCount}人</div>
      )}

      {/* コンテンツエリア */}
      <div className={styles.contentArea}>
        {/* 画像またはテキスト */}
        {imageUrl ? (
          <div className={styles.imageWrapper}>
            <img src={imageUrl} alt={text} className={styles.image} />
          </div>
        ) : (
          <span className={styles.textOnly}>{text}</span>
        )}

        {/* テキスト（画像がある場合） */}
        {imageUrl && <span className={styles.textWithImage}>{text}</span>}
      </div>
    </button>
  );
}
