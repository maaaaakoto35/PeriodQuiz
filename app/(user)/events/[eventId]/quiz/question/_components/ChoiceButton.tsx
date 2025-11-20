import Image from "next/image";

interface ChoiceButtonProps {
  id: number;
  text: string;
  imageUrl: string | null;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (choiceId: number) => void;
}

/**
 * 個別の選択肢ボタン
 * テキスト＋画像を表示し、選択/非選択状態を管理
 */
export function ChoiceButton({
  id,
  text,
  imageUrl,
  isSelected,
  isDisabled,
  onSelect,
}: ChoiceButtonProps) {
  // ID をボタン番号に変換 (1, 2, 3, 4)
  const buttonNumber = id % 4 || 4;

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
        ${
          isSelected
            ? "border-blue-500 bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg scale-95"
            : "border-gray-400 bg-gradient-to-br from-gray-50 to-white hover:border-gray-500 hover:shadow-md"
        }
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
