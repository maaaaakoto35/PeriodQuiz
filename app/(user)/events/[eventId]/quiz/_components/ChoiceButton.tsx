import Image from "next/image";

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
}: ChoiceButtonProps) {
  // 正解/不正解の背景色を決定
  let borderColor = isSelected
    ? "border-blue-500 bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg scale-95"
    : "border-gray-400 bg-gradient-to-br from-gray-50 to-white hover:border-gray-500 hover:shadow-md";

  // answer画面で正解/不正解を表示する場合
  if (showCorrectness) {
    if (userSelected && isCorrect) {
      // ユーザーが選択した選択肢が正解
      borderColor =
        "border-green-500 bg-gradient-to-br from-green-100 to-green-50 shadow-lg";
    } else if (userSelected && !isCorrect) {
      // ユーザーが選択した選択肢が不正解
      borderColor =
        "border-red-500 bg-gradient-to-br from-red-100 to-red-50 shadow-lg";
    } else if (isCorrect && !userSelected) {
      // ユーザーが選択していない正解
      borderColor =
        "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md";
    }
  }

  return (
    <button
      onClick={() => onSelect(id)}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center
        w-full aspect-square
        p-3 space-y-2
        border-3 rounded-2xl
        transition-all duration-200
        relative overflow-hidden
        group
        ${borderColor}
        ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer active:scale-90"
        }
      `}
    >
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* ボタン番号バッジ */}
      <div
        className={`
        absolute top-2 right-2
        w-6 h-6 rounded-full
        flex items-center justify-center
        text-xs font-bold text-white
        shadow-md
        ${
          buttonNumber === 1
            ? "bg-blue-500"
            : buttonNumber === 2
            ? "bg-red-500"
            : buttonNumber === 3
            ? "bg-green-500"
            : "bg-yellow-500"
        }
      `}
      >
        {buttonNumber}
      </div>

      {/* 正解/不正解バッジ（answer画面用） */}
      {showCorrectness && isCorrect && !userSelected && (
        <div
          className="
          absolute top-2 left-2
          w-6 h-6 rounded-full
          flex items-center justify-center
          text-xs font-bold text-white
          bg-green-500 shadow-md
        "
        >
          ✓
        </div>
      )}

      {showCorrectness && userSelected && isCorrect && (
        <div
          className="
          absolute bottom-2 right-2
          px-2 py-1 rounded-full
          bg-green-500 text-white
          text-xs font-bold
        "
        >
          正解
        </div>
      )}

      {showCorrectness && userSelected && !isCorrect && (
        <div
          className="
          absolute bottom-2 right-2
          px-2 py-1 rounded-full
          bg-red-500 text-white
          text-xs font-bold
        "
        >
          不正解
        </div>
      )}

      {/* 選択数表示（answer画面用） */}
      {showCorrectness && selectionCount !== undefined && (
        <div
          className="
          absolute bottom-2 left-2
          px-2 py-1 rounded-full
          bg-gray-700 text-white
          text-xs font-bold
        "
        >
          {selectionCount}人
        </div>
      )}

      {/* 画像またはテキスト */}
      {imageUrl ? (
        <div className="relative w-16 h-16">
          <Image src={imageUrl} alt={text} fill className="object-contain" />
        </div>
      ) : (
        <span className="text-sm font-bold text-gray-700 line-clamp-3">
          {text}
        </span>
      )}

      {/* テキスト（画像がある場合） */}
      {imageUrl && (
        <span className="text-xs font-bold text-center text-gray-700 line-clamp-2">
          {text}
        </span>
      )}
    </button>
  );
}
