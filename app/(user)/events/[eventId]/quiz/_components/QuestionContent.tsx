import Image from "next/image";

interface QuestionContentProps {
  text: string;
  imageUrl: string | null;
}

/**
 * 問題の内容（テキスト＋画像）を表示
 */
export function QuestionContent({ text, imageUrl }: QuestionContentProps) {
  return (
    <div className="w-full space-y-4">
      {/* Q マーク付き問題テキスト */}
      <div className="flex items-start gap-3">
        <div
          className="
          flex-shrink-0 w-10 h-10
          bg-gradient-to-br from-purple-400 to-pink-500
          rounded-full
          flex items-center justify-center
          shadow-md
        "
        >
          <span className="text-white font-bold text-lg">Q</span>
        </div>
        <p
          className="
          flex-1 text-lg font-bold text-gray-800
          leading-relaxed pt-1
        "
        >
          {text}
        </p>
      </div>

      {/* 問題画像 */}
      {imageUrl && (
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-md">
          <Image
            src={imageUrl}
            alt="問題画像"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </div>
  );
}
